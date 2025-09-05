import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { users, universities } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { userRepository } from "@/dal/userRepository";

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

    // Find participants to update via repository
    const participantsToUpdate = await userRepository.getByIds(participantIds);

    if (participantsToUpdate.length === 0) {
      return NextResponse.json(
        { error: "No participants found with the provided IDs" },
        { status: 404 },
      );
    }

    const foundIds = participantsToUpdate.map((p) => p.id);
    const notFoundIds = participantIds.filter((id) => !foundIds.includes(id));

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (checkedIn !== undefined) updateData.checkedIn = checkedIn;

    // Use repository to perform bulk update
    const updatedParticipants = await userRepository.updateMany(
      foundIds,
      updateData,
    );

    const transformedParticipants = participantsToUpdate.map((p) => ({
      id: p.id,
      firstName: p.fName,
      lastName: p.lName,
      email: (p as any).email,
      university: (p as any).university || "N/A",
      status: (p as any).status,
      checkedIn: (p as any).checkedIn || false,
      registrationDate: (p as any).timestamp || new Date().toISOString(),
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

// Alternative endpoint for bulk operations
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
              firstName: p.fName,
              lastName: p.lName,
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
            firstName: users.fName,
            lastName: users.lName,
            email: users.email,
            university: universities.uni,
            status: users.status,
            checked_in: users.checkedIn,
            yearOfStudy: users.yearOfStudy,
            parking: users.parking,
            previousAttendance: users.prevAttendance,
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
