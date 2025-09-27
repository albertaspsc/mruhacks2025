import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db/drizzle";
import {
  users,
  gender,
  universities,
  majors,
  experienceTypes,
  marketingTypes,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check admin authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin status
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("id, role, status")
      .eq("id", user.id)
      .single();

    if (adminError || !adminData || adminData.status !== "active") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    // Fetch all participants
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
        yearOfStudy: users.yearOfStudy,
        experience: experienceTypes.experience,
        marketing: marketingTypes.marketing,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .leftJoin(gender, eq(users.gender, gender.id))
      .leftJoin(universities, eq(users.university, universities.id))
      .leftJoin(majors, eq(users.major, majors.id))
      .leftJoin(experienceTypes, eq(users.experience, experienceTypes.id))
      .leftJoin(marketingTypes, eq(users.marketing, marketingTypes.id))
      .orderBy(desc(users.timestamp));

    if (!participants || participants.length === 0) {
      // Return empty CSV
      const csvContent = "No participants found\n";
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=participant-stats.csv",
        },
      });
    }

    // Prepare CSV data
    const csvRows = [
      // Header row
      [
        "ID",
        "First Name",
        "Last Name",
        "Email",
        "Gender",
        "University",
        "Major",
        "Year of Study",
        "Experience Level",
        "Marketing Source",
        "Previous Attendance",
        "Status",
        "Checked In",
        "Registration Date",
        "Updated At",
      ],
    ];

    // Add participant data rows
    participants.forEach((participant) => {
      csvRows.push([
        participant.id,
        participant.f_name || "",
        participant.l_name || "",
        participant.email || "",
        participant.gender || "Unknown",
        participant.university || "Unknown",
        participant.major || "Unknown",
        participant.yearOfStudy || "",
        participant.experience || "Unknown",
        participant.marketing || "Unknown",
        participant.prev_attendance ? "Yes" : "No",
        participant.status || "",
        participant.checked_in ? "Yes" : "No",
        participant.timestamp || "",
        participant.updatedAt || "",
      ]);
    });

    // Convert to CSV string
    const csvContent = csvRows
      .map((row) =>
        row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=participant-stats.csv",
      },
    });
  } catch (error) {
    console.error("Error exporting participant statistics:", error);
    return NextResponse.json(
      { error: "Failed to export participant statistics" },
      { status: 500 },
    );
  }
}
