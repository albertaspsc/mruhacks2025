import { NextRequest, NextResponse } from "next/server";
import { db } from "src/db/drizzle";
import {
  users,
  profiles,
  universities,
  majors,
  gender,
  experienceTypes,
  marketingTypes,
} from "src/db/schema";
import { eq, desc, ilike, or, and } from "drizzle-orm";

// GET - Fetches all participants with related data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const statusFilter = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    const whereConditions = [];

    // Add search filter if provided for first name, last name, email, or school email
    if (search) {
      whereConditions.push(
        or(
          ilike(users.firstName, `%${search}%`),
          ilike(users.lastName, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(users.schoolEmail, `%${search}%`),
        ),
      );
    }

    // Add status filter if provided for user status
    if (statusFilter && statusFilter !== "all") {
      whereConditions.push(eq(users.status, statusFilter as any));
    }

    // Build the complete query based on whether we have conditions
    const baseQuery = db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        university: universities.university,
        status: users.status,
        checkedIn: users.checkedIn,
        registrationDate: users.timestamp,
        schoolEmail: users.schoolEmail,
        yearOfStudy: users.yearOfStudy,
        parking: users.parking,
        previousAttendance: users.previousAttendance,
        accommodations: users.accommodations,
        resume: users.resume,
      })
      .from(users)
      .leftJoin(universities, eq(users.university, universities.id));

    // Execute query with or without conditions
    const participants =
      whereConditions.length > 0
        ? await baseQuery
            .where(and(...whereConditions))
            .orderBy(desc(users.timestamp))
            .limit(limit)
            .offset(offset)
        : await baseQuery
            .orderBy(desc(users.timestamp))
            .limit(limit)
            .offset(offset);

    // Transform the data to match the frontend interface
    const transformedParticipants = participants.map(
      (participant: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        university: string | null;
        status: "pending" | "confirmed" | "waitlisted";
        checkedIn: boolean;
        registrationDate: Date | null;
        schoolEmail: string;
        yearOfStudy: "1st" | "2nd" | "3rd" | "4th+" | "Recent Grad";
        parking: "Yes" | "No" | "Not sure";
        previousAttendance: boolean;
        accommodations: string;
        resume: string | null;
      }) => ({
        id: participant.id,
        firstName: participant.firstName,
        lastName: participant.lastName,
        email: participant.email,
        university: participant.university,
        status: participant.status,
        checkedIn: participant.checkedIn,
        registrationDate:
          participant.registrationDate?.toISOString() ||
          new Date().toISOString(),
      }),
    );

    return NextResponse.json(transformedParticipants, { status: 200 });
  } catch (error) {
    console.error("Error fetching participants:", error);
    return NextResponse.json(
      { error: "Failed to fetch participants" },
      { status: 500 },
    );
  }
}
