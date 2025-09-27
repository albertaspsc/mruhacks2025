import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { users, universities, gender, admins } from "@/db/schema";
import { eq, isNull, and } from "drizzle-orm";
import { verifyApiAuth } from "@/app/auth/api-auth";

// PATCH - Update participant status and/or checkedIn status
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  // Verify authentication first
  const authResult = await verifyApiAuth(request);

  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const user = authResult.user!;

  // Check if user has required role
  if (!["admin", "volunteer"].includes(user.role)) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 },
    );
  }
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status, checkedIn } = body;

    const updateData: any = {};

    // Role-based field validation
    if (user.role === "volunteer") {
      // Volunteers can only update checkedIn status
      if (status !== undefined) {
        return NextResponse.json(
          { error: "Volunteers can only update check-in status" },
          { status: 403 },
        );
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
    } else if (user.role === "admin") {
      // Admins can update both status and checkedIn
      if (status !== undefined) {
        if (
          ![
            "pending",
            "confirmed",
            "waitlisted",
            "denied",
            "declined",
          ].includes(status)
        ) {
          return NextResponse.json(
            {
              error:
                "Invalid status. Must be: pending, confirmed, or waitlisted",
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

    // Return different data based on role
    if (user.role === "volunteer") {
      // Limited access for volunteers
      const response = {
        id: updatedParticipant.id,
        f_name: updatedParticipant.fName,
        l_name: updatedParticipant.lName,
        status: updatedParticipant.status,
        checked_in: updatedParticipant.checkedIn,
      };
      return NextResponse.json(response, { status: 200 });
    } else {
      // Full access for admins
      const response = {
        id: updatedParticipant.id,
        f_name: updatedParticipant.fName,
        l_name: updatedParticipant.lName,
        email: updatedParticipant.email,
        status: updatedParticipant.status,
        checked_in: updatedParticipant.checkedIn,
        timestamp: updatedParticipant.timestamp || new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 200 });
    }
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
  // Verify authentication first
  const authResult = await verifyApiAuth(request);

  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const user = authResult.user!;

  // Check if user has required role
  if (!["admin", "volunteer"].includes(user.role)) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 },
    );
  }

  try {
    const { id } = await context.params;

    if (user.role === "volunteer") {
      // Limited data for volunteers
      const [participant] = await db
        .select({
          id: users.id,
          f_name: users.fName,
          l_name: users.lName,
          university: universities.uni,
          status: users.status,
          checked_in: users.checkedIn,
          gender: gender.gender,
        })
        .from(users)
        .leftJoin(universities, eq(users.university, universities.id))
        .leftJoin(gender, eq(users.gender, gender.id))
        .leftJoin(admins, eq(users.id, admins.id))
        .where(and(eq(users.id, id), isNull(admins.id)))
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
        university: participant.university || "N/A",
        status: participant.status,
        checked_in: participant.checked_in,
        gender: participant.gender || "Not specified",
      };

      return NextResponse.json(response, { status: 200 });
    } else {
      // Full data for admins
      const [participant] = await db
        .select({
          id: users.id,
          f_name: users.fName,
          l_name: users.lName,
          email: users.email,
          university: universities.uni,
          status: users.status,
          checked_in: users.checkedIn,
          timestamp: users.timestamp,
        })
        .from(users)
        .leftJoin(universities, eq(users.university, universities.id))
        .leftJoin(admins, eq(users.id, admins.id))
        .where(and(eq(users.id, id), isNull(admins.id)))
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
        timestamp: participant.timestamp || new Date().toISOString(),
      };

      return NextResponse.json(response, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch participant" },
      { status: 500 },
    );
  }
}
