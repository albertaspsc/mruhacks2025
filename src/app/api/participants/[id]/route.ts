import { NextRequest, NextResponse } from "next/server";
import { db } from "src/db/drizzle";
import { users, universities } from "src/db/schema";
import { eq } from "drizzle-orm";

// PATCH - Update participant status only
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    // Validate status field
    if (!status || !["pending", "confirmed", "waitlisted"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be: pending, confirmed, or waitlisted" },
        { status: 400 },
      );
    }

    // Check if participant exists and update status
    const [updatedParticipant] = await db
      .update(users)
      .set({ status })
      .where(eq(users.id, id))
      .returning();

    if (!updatedParticipant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 },
      );
    }

    // Get participant with university name for response
    const [participantWithUni] = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        university: universities.university,
        status: users.status,
        registrationDate: users.timestamp,
      })
      .from(users)
      .leftJoin(universities, eq(users.university, universities.id))
      .where(eq(users.id, id))
      .limit(1);

    const response = {
      id: participantWithUni.id,
      firstName: participantWithUni.firstName,
      lastName: participantWithUni.lastName,
      email: participantWithUni.email,
      university: participantWithUni.university,
      status: participantWithUni.status,
      checkedIn: false,
      registrationDate:
        participantWithUni.registrationDate?.toISOString() ||
        new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error updating participant status:", error);
    return NextResponse.json(
      { error: "Failed to update participant status" },
      { status: 500 },
    );
  }
}
