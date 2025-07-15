import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../db/drizzle";
import { users, universities } from "../../../../db/schema";
import { eq } from "drizzle-orm";

// PATCH - Update participant status and/or checkedIn status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, checkedIn } = body;

    // Prepare update object - use any to avoid type conflicts
    const updateData: any = {};

    // Validate and add status if provided
    if (status !== undefined) {
      if (!["pending", "confirmed", "waitlisted"].includes(status)) {
        return NextResponse.json(
          {
            error: "Invalid status. Must be: pending, confirmed, or waitlisted",
          },
          { status: 400 },
        );
      }
      updateData.status = status;
    }

    // Validate and add checkedIn if provided
    if (checkedIn !== undefined) {
      if (typeof checkedIn !== "boolean") {
        return NextResponse.json(
          { error: "checkedIn must be a boolean value" },
          { status: 400 },
        );
      }
      updateData.checkedIn = checkedIn;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    // Check if participant exists and update
    const [updatedParticipant] = await db
      .update(users)
      .set(updateData)
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
        checkedIn: users.checkedIn,
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
      checkedIn: participantWithUni.checkedIn,
      registrationDate:
        participantWithUni.registrationDate?.toISOString() ||
        new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error updating participant:", error);

    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      { error: "Failed to update participant" },
      { status: 500 },
    );
  }
}

// GET - Get single participant
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const [participant] = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        university: universities.university,
        status: users.status,
        checkedIn: users.checkedIn,
        registrationDate: users.timestamp,
      })
      .from(users)
      .leftJoin(universities, eq(users.university, universities.id))
      .where(eq(users.id, id))
      .limit(1);

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 },
      );
    }

    const response = {
      id: participant.id,
      firstName: participant.firstName,
      lastName: participant.lastName,
      email: participant.email,
      university: participant.university,
      status: participant.status,
      checkedIn: participant.checkedIn,
      registrationDate:
        participant.registrationDate?.toISOString() || new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching participant:", error);
    return NextResponse.json(
      { error: "Failed to fetch participant" },
      { status: 500 },
    );
  }
}
