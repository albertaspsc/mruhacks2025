import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../db/drizzle";
import { users, universities } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";

// GET - Fetches all participants with minimal fields for debugging
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Starting participants fetch...");

    // Test database connection first
    console.log("📦 Testing database connection...");

    // Start with the simplest possible query
    const simpleTest = await db.select().from(users).limit(1);
    console.log(
      "✅ Database connection successful, sample user:",
      simpleTest[0] || "No users found",
    );

    // Test universities table
    console.log("Testing universities table...");
    const universityTest = await db.select().from(universities).limit(1);
    console.log(
      "✅ Universities table accessible, sample:",
      universityTest[0] || "No universities found",
    );

    // Now try the full query
    console.log("🔄 Executing full query...");

    const participants = await db
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
      .orderBy(desc(users.timestamp))
      .limit(100);

    console.log(
      `✅ Query successful, found ${participants.length} participants`,
    );

    // Transform the data
    const transformedParticipants = participants.map((participant, index) => {
      console.log(`🔄 Transforming participant ${index + 1}:`, {
        id: participant.id,
        firstName: participant.firstName,
        university: participant.university,
      });

      return {
        id: participant.id,
        firstName: participant.firstName,
        lastName: participant.lastName,
        email: participant.email,
        university: participant.university || "N/A",
        status: participant.status,
        checkedIn: participant.checkedIn || false,
        registrationDate:
          participant.registrationDate?.toISOString() ||
          new Date().toISOString(),
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

    // Check if it's a database connection error
    if (error instanceof Error) {
      if (
        error.message.includes("connect") ||
        error.message.includes("ECONNREFUSED")
      ) {
        console.error("🔌 Database connection issue detected");
      } else if (
        error.message.includes("column") ||
        error.message.includes("table")
      ) {
        console.error("📋 Database schema issue detected");
      } else if (error.message.includes("syntax")) {
        console.error("📝 SQL syntax issue detected");
      }
    }

    // Return empty array for safety
    return NextResponse.json([], { status: 200 });
  }
}
