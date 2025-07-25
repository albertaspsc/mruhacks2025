import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../db/drizzle";
import { users, universities } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Starting participants fetch...");

    // Use the correct column names from your actual database
    const participants = await db
      .select({
        id: users.id,
        f_name: users.firstName, // Drizzle maps f_name column to firstName property
        l_name: users.lastName, // Drizzle maps l_name column to lastName property
        email: users.email,
        university: universities.university,
        status: users.status,
        checked_in: users.checkedIn, // This should work now that we added the column
        timestamp: users.timestamp,
        gender: users.gender,
        prev_attendance: users.previousAttendance,
        major: users.major,
        parking: users.parking,
        yearOfStudy: users.yearOfStudy,
        experience: users.experience,
        accommodations: users.accommodations,
        marketing: users.marketing,
      })
      .from(users)
      .leftJoin(universities, eq(users.university, universities.id))
      .orderBy(desc(users.timestamp))
      .limit(100);

    console.log(
      `✅ Query successful, found ${participants.length} participants`,
    );

    // Transform the data for your React component
    const transformedParticipants = participants.map((participant, index) => {
      console.log(`🔄 Transforming participant ${index + 1}:`, {
        id: participant.id,
        f_name: participant.f_name,
        l_name: participant.l_name,
      });

      return {
        id: participant.id,
        f_name: participant.f_name,
        l_name: participant.l_name,
        email: participant.email,
        university: participant.university || "N/A",
        status: participant.status,
        checked_in: participant.checked_in || false,
        timestamp:
          participant.timestamp?.toISOString() || new Date().toISOString(),
        // Include other fields your component might need
        gender: participant.gender,
        prev_attendance: participant.prev_attendance,
        major: participant.major,
        parking: participant.parking,
        yearOfStudy: participant.yearOfStudy,
        experience: participant.experience,
        accommodations: participant.accommodations,
        marketing: participant.marketing,
      };
    });

    console.log("✅ Transformation complete, returning data");
    return NextResponse.json(transformedParticipants, { status: 200 });
  } catch (error) {
    console.error("Error in participants API:");
    console.error("Error type:", typeof error);
    console.error(
      "Error message:",
      error instanceof Error ? error.message : String(error),
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace",
    );

    return NextResponse.json([], { status: 200 });
  }
}
