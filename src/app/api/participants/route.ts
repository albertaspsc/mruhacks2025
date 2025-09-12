import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import {
  users,
  gender,
  universities,
  majors,
  experienceTypes,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { withApiAuth } from "@/app/auth/api-auth";

export const GET = withApiAuth(
  async (request: NextRequest, user: any) => {
    try {
      // Check if user is volunteer - volunteers get limited data
      if (user.role === "volunteer") {
        const participants = await db
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
          .leftJoin(gender, eq(users.gender, gender.id))
          .leftJoin(universities, eq(users.university, universities.id))
          .orderBy(desc(users.timestamp))
          .limit(100);

        const transformedParticipants = participants.map((participant) => ({
          id: participant.id,
          f_name: participant.f_name,
          l_name: participant.l_name,
          university: participant.university || "N/A",
          status: participant.status,
          checked_in: participant.checked_in || false,
          gender: participant.gender || "Not specified",
        }));

        return NextResponse.json(transformedParticipants);
      }

      // Admins get full data
      const participants = await db
        .select({
          id: users.id,
          f_name: users.fName,
          l_name: users.lName,
          email: users.email,
          university: universities.uni,
          status: users.status,
          checked_in: users.checkedIn,
          timestamp: users.timestamp,
          gender: gender.gender,
          prev_attendance: users.prevAttendance,
          major: majors.major,
          parking: users.parking,
          yearOfStudy: users.yearOfStudy,
          experience: experienceTypes.experience,
          accommodations: users.accommodations,
          marketing: users.marketing,
        })
        .from(users)
        .leftJoin(gender, eq(users.gender, gender.id))
        .leftJoin(universities, eq(users.university, universities.id))
        .leftJoin(majors, eq(users.major, majors.id))
        .leftJoin(experienceTypes, eq(users.experience, experienceTypes.id))
        .orderBy(desc(users.timestamp))
        .limit(100);

      const transformedParticipants = participants.map((participant) => ({
        id: participant.id,
        f_name: participant.f_name,
        l_name: participant.l_name,
        email: participant.email,
        university: participant.university || "N/A",
        status: participant.status,
        checked_in: participant.checked_in || false,
        timestamp: participant.timestamp || new Date().toISOString(),
        gender: participant.gender || "Not specified",
        prev_attendance: participant.prev_attendance,
        major: participant.major || "N/A",
        parking: participant.parking,
        yearOfStudy: participant.yearOfStudy,
        experience: participant.experience || "N/A",
        accommodations: participant.accommodations,
        marketing: participant.marketing,
      }));

      return NextResponse.json(transformedParticipants);
    } catch (error) {
      console.error("Error fetching participants:", error);
      return NextResponse.json(
        { error: "Failed to fetch participants" },
        { status: 500 },
      );
    }
  },
  { requiredRoles: ["admin", "volunteer"] }, // Both roles can access, but get different data
);
