import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { users, universities } from "@/db/schema";
import { eq } from "drizzle-orm";

// PATCH - Update participant status and/or checkedIn status
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status, checkedIn } = body;

    const updateData: any = {};

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

    if (checkedIn !== undefined) {
      if (typeof checkedIn !== "boolean") {
        return NextResponse.json(
          { error: "checkedIn must be a boolean value" },
          { status: 400 },
        );
      }
      updateData.checkedIn = checkedIn;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

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

    const response = {
      id: updatedParticipant.id,
      f_name: updatedParticipant.firstName,
      l_name: updatedParticipant.lastName,
      email: updatedParticipant.email,
      status: updatedParticipant.status,
      checked_in: updatedParticipant.checkedIn,
      timestamp:
        updatedParticipant.timestamp?.toISOString() || new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update participant" },
      { status: 500 },
    );
  }
}

// GET - Get single participant
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const [participant] = await db
      .select({
        id: users.id,
        f_name: users.firstName,
        l_name: users.lastName,
        email: users.email,
        university: universities.university,
        status: users.status,
        checked_in: users.checkedIn,
        timestamp: users.timestamp,
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
      f_name: participant.f_name,
      l_name: participant.l_name,
      email: participant.email,
      university: participant.university,
      status: participant.status,
      checked_in: participant.checked_in,
      timestamp:
        participant.timestamp?.toISOString() || new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch participant" },
      { status: 500 },
    );
  }
}
