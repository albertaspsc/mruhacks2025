import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../db/drizzle";
import { users, universities } from "../../../../db/schema";
import { eq, inArray } from "drizzle-orm";

interface BulkUpdateRequest {
  participantIds: string[];
  status?: "pending" | "confirmed" | "waitlisted";
  checkedIn?: boolean;
}

// PATCH - to update multiple participants at once
export async function PATCH(request: NextRequest) {
  try {
    const body: BulkUpdateRequest = await request.json();
    const { participantIds, status, checkedIn } = body;

    // Validation
    if (
      !participantIds ||
      !Array.isArray(participantIds) ||
      participantIds.length === 0
    ) {
      return NextResponse.json(
        { error: "participantIds must be a non-empty array" },
        { status: 400 },
      );
    }

    if (status === undefined && checkedIn === undefined) {
      return NextResponse.json(
        {
          error:
            "At least one field (status or checkedIn) must be provided for update",
        },
        { status: 400 },
      );
    }

    // Validate status if provided
    if (status && !["pending", "confirmed", "waitlisted"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be: pending, confirmed, or waitlisted" },
        { status: 400 },
      );
    }

    // Validate checkedIn if provided
    if (checkedIn !== undefined && typeof checkedIn !== "boolean") {
      return NextResponse.json(
        { error: "checkedIn must be a boolean value" },
        { status: 400 },
      );
    }

    // Find participants to update
    const participantsToUpdate = await db
      .select()
      .from(users)
      .where(inArray(users.id, participantIds));

    if (participantsToUpdate.length === 0) {
      return NextResponse.json(
        { error: "No participants found with the provided IDs" },
        { status: 404 },
      );
    }

    // Check if some IDs were not found
    const foundIds = participantsToUpdate.map((p) => p.id);
    const notFoundIds = participantIds.filter((id) => !foundIds.includes(id));

    // Prepare update data - use any to avoid type conflicts
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (checkedIn !== undefined) updateData.checkedIn = checkedIn;

    // Perform bulk update using transaction for consistency
    const updatedParticipants = await db.transaction(async (tx) => {
      // Updates all participants
      const updated = await tx
        .update(users)
        .set(updateData)
        .where(inArray(users.id, foundIds))
        .returning();

      return updated;
    });

    // Get updated participants with university names for response
    const participantsWithUni = await db
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
      .where(inArray(users.id, foundIds));

    // Transform for response
    const transformedParticipants = participantsWithUni.map((p) => ({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email,
      university: p.university,
      status: p.status,
      checkedIn: p.checkedIn,
      registrationDate:
        p.registrationDate?.toISOString() || new Date().toISOString(),
    }));

    const response = {
      message: "Bulk update completed successfully",
      updatedCount: updatedParticipants.length,
      updatedParticipants: transformedParticipants,
      ...(notFoundIds.length > 0 && {
        warning: `${notFoundIds.length} participant(s) not found`,
        notFoundIds,
      }),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in bulk update:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk update" },
      { status: 500 },
    );
  }
}

// POST /api/participants/bulk-update - Alternative endpoint for bulk operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, participantIds, data } = body;

    if (!operation || !participantIds || !Array.isArray(participantIds)) {
      return NextResponse.json(
        { error: "operation and participantIds (array) are required" },
        { status: 400 },
      );
    }

    switch (operation) {
      case "delete":
        // Find participants to delete
        const participantsToDelete = await db
          .select()
          .from(users)
          .where(inArray(users.id, participantIds));

        if (participantsToDelete.length === 0) {
          return NextResponse.json(
            { error: "No participants found with the provided IDs" },
            { status: 404 },
          );
        }

        // Delete the participants
        await db.delete(users).where(inArray(users.id, participantIds));

        return NextResponse.json(
          {
            message: "Participants deleted successfully",
            deletedCount: participantsToDelete.length,
            deletedParticipants: participantsToDelete.map((p) => ({
              id: p.id,
              firstName: p.firstName,
              lastName: p.lastName,
              email: p.email,
            })),
          },
          { status: 200 },
        );

      case "export":
        // Export participants data
        const participantsToExport = await db
          .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            university: universities.university,
            status: users.status,
            checked_in: users.checkedIn,
            yearOfStudy: users.yearOfStudy,
            parking: users.parking,
            previousAttendance: users.previousAttendance,
            accommodations: users.accommodations,
            registrationDate: users.timestamp,
          })
          .from(users)
          .leftJoin(universities, eq(users.university, universities.id))
          .where(inArray(users.id, participantIds));

        return NextResponse.json(
          {
            message: "Export data retrieved successfully",
            count: participantsToExport.length,
            participants: participantsToExport,
          },
          { status: 200 },
        );

      default:
        return NextResponse.json(
          { error: "Unsupported operation. Supported: delete, export" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Error in bulk operation:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk operation" },
      { status: 500 },
    );
  }
}
