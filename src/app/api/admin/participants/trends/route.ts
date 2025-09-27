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
import { eq, desc, and, gte } from "drizzle-orm";

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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const marketingChannel = searchParams.get("marketing");
    const experienceLevel = searchParams.get("experience");
    const major = searchParams.get("major");
    const genderFilter = searchParams.get("gender");
    const university = searchParams.get("university");
    const days = parseInt(searchParams.get("days") || "30");

    // Build filter conditions
    const conditions = [];

    if (marketingChannel) {
      const marketingId = await db
        .select({ id: marketingTypes.id })
        .from(marketingTypes)
        .where(eq(marketingTypes.marketing, marketingChannel))
        .limit(1);

      if (marketingId.length > 0) {
        conditions.push(eq(users.marketing, marketingId[0].id));
      }
    }

    if (experienceLevel) {
      const experienceId = await db
        .select({ id: experienceTypes.id })
        .from(experienceTypes)
        .where(eq(experienceTypes.experience, experienceLevel))
        .limit(1);

      if (experienceId.length > 0) {
        conditions.push(eq(users.experience, experienceId[0].id));
      }
    }

    if (major) {
      const majorId = await db
        .select({ id: majors.id })
        .from(majors)
        .where(eq(majors.major, major))
        .limit(1);

      if (majorId.length > 0) {
        conditions.push(eq(users.major, majorId[0].id));
      }
    }

    if (genderFilter) {
      const genderId = await db
        .select({ id: gender.id })
        .from(gender)
        .where(eq(gender.gender, genderFilter))
        .limit(1);

      if (genderId.length > 0) {
        conditions.push(eq(users.gender, genderId[0].id));
      }
    }

    if (university) {
      const universityId = await db
        .select({ id: universities.id })
        .from(universities)
        .where(eq(universities.uni, university))
        .limit(1);

      if (universityId.length > 0) {
        conditions.push(eq(users.university, universityId[0].id));
      }
    }

    // Add date filter for the specified number of days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    conditions.push(gte(users.timestamp, startDate.toISOString()));

    // Fetch filtered participants
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
      })
      .from(users)
      .leftJoin(gender, eq(users.gender, gender.id))
      .leftJoin(universities, eq(users.university, universities.id))
      .leftJoin(majors, eq(users.major, majors.id))
      .leftJoin(experienceTypes, eq(users.experience, experienceTypes.id))
      .leftJoin(marketingTypes, eq(users.marketing, marketingTypes.id))
      .where(and(...conditions))
      .orderBy(desc(users.timestamp));

    // Group by date and create trends data
    const dailyCounts = participants.reduce(
      (acc: Record<string, number>, participant) => {
        if (!participant.timestamp) return acc;
        const date = new Date(participant.timestamp)
          .toISOString()
          .split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Fill in missing dates with 0 counts
    const trends = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      trends.push({
        date: dateStr,
        count: dailyCounts[dateStr] || 0,
        formattedDate: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      });
    }

    // Get filter options for the UI
    const [
      marketingOptions,
      experienceOptions,
      majorOptions,
      genderOptions,
      universityOptions,
    ] = await Promise.all([
      db
        .select({
          value: marketingTypes.marketing,
          label: marketingTypes.marketing,
        })
        .from(marketingTypes),
      db
        .select({
          value: experienceTypes.experience,
          label: experienceTypes.experience,
        })
        .from(experienceTypes),
      db.select({ value: majors.major, label: majors.major }).from(majors),
      db.select({ value: gender.gender, label: gender.gender }).from(gender),
      db
        .select({ value: universities.uni, label: universities.uni })
        .from(universities),
    ]);

    const response = {
      trends,
      totalRegistrations: participants.length,
      filterOptions: {
        marketing: marketingOptions,
        experience: experienceOptions,
        major: majorOptions,
        gender: genderOptions,
        university: universityOptions,
      },
      appliedFilters: {
        marketing: marketingChannel,
        experience: experienceLevel,
        major,
        gender: genderFilter,
        university,
        days,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching registration trends:", error);
    return NextResponse.json(
      { error: "Failed to fetch registration trends" },
      { status: 500 },
    );
  }
}
