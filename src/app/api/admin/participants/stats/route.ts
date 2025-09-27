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
  dietaryRestrictions,
  interests,
  userDietRestrictions,
  userInterests,
  admins,
} from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";

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

    // Check admin status using Drizzle
    const adminData = await db
      .select({
        id: admins.id,
        role: admins.role,
        status: admins.status,
      })
      .from(admins)
      .where(eq(admins.id, user.id))
      .limit(1);

    if (!adminData.length || adminData[0].status !== "active") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    // Check if there are any participants
    const participantCount = await db
      .select({ count: sql<number>`count(*)`.as("count") })
      .from(users);

    if (participantCount[0].count === 0) {
      return NextResponse.json({
        totalParticipants: 0,
        confirmedParticipants: 0,
        pendingParticipants: 0,
        waitlistedParticipants: 0,
        checkedInParticipants: 0,
        genderDistribution: [],
        universityDistribution: [],
        majorDistribution: [],
        yearOfStudyDistribution: [],
        experienceDistribution: [],
        marketingDistribution: [],
        dietaryRestrictionsDistribution: [],
        interestsDistribution: [],
        previousAttendance: { attended: 0, notAttended: 0 },
        registrationTrends: [],
        averageRegistrationTime: "N/A",
      });
    }

    // Calculate basic statistics using Drizzle
    const basicStats = await db
      .select({
        totalParticipants: sql<number>`count(*)`.as("totalParticipants"),
        confirmedParticipants:
          sql<number>`count(*) filter (where ${users.status} = 'confirmed')`.as(
            "confirmedParticipants",
          ),
        pendingParticipants:
          sql<number>`count(*) filter (where ${users.status} = 'pending')`.as(
            "pendingParticipants",
          ),
        waitlistedParticipants:
          sql<number>`count(*) filter (where ${users.status} = 'waitlisted')`.as(
            "waitlistedParticipants",
          ),
        checkedInParticipants:
          sql<number>`count(*) filter (where ${users.checkedIn} = true)`.as(
            "checkedInParticipants",
          ),
        previousAttendance:
          sql<number>`count(*) filter (where ${users.prevAttendance} = true)`.as(
            "previousAttendance",
          ),
      })
      .from(users);

    const {
      totalParticipants,
      confirmedParticipants,
      pendingParticipants,
      waitlistedParticipants,
      checkedInParticipants,
      previousAttendance: attendedCount,
    } = basicStats[0];

    // Gender distribution using Drizzle
    const genderDistributionData = await db
      .select({
        gender: gender.gender,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(users)
      .leftJoin(gender, eq(users.gender, gender.id))
      .groupBy(gender.gender)
      .orderBy(desc(sql`count(*)`));

    const genderDistribution = genderDistributionData.map((item) => ({
      gender: item.gender || "Unknown",
      count: item.count,
      percentage: (item.count / totalParticipants) * 100,
    }));

    // University distribution using Drizzle
    const universityDistributionData = await db
      .select({
        university: universities.uni,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(users)
      .leftJoin(universities, eq(users.university, universities.id))
      .groupBy(universities.uni)
      .orderBy(desc(sql`count(*)`));

    const universityDistribution = universityDistributionData.map((item) => ({
      university: item.university || "Unknown",
      count: item.count,
      percentage: (item.count / totalParticipants) * 100,
    }));

    // Major distribution using Drizzle
    const majorDistributionData = await db
      .select({
        major: majors.major,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(users)
      .leftJoin(majors, eq(users.major, majors.id))
      .groupBy(majors.major)
      .orderBy(desc(sql`count(*)`));

    const majorDistribution = majorDistributionData.map((item) => ({
      major: item.major || "Unknown",
      count: item.count,
      percentage: (item.count / totalParticipants) * 100,
    }));

    // Year of study distribution using Drizzle
    const yearOfStudyDistributionData = await db
      .select({
        year: users.yearOfStudy,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(users)
      .groupBy(users.yearOfStudy)
      .orderBy(desc(sql`count(*)`));

    const yearOfStudyDistribution = yearOfStudyDistributionData.map((item) => ({
      year: item.year || "Unknown",
      count: item.count,
      percentage: (item.count / totalParticipants) * 100,
    }));

    // Experience level distribution using Drizzle
    const experienceDistributionData = await db
      .select({
        experience: experienceTypes.experience,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(users)
      .leftJoin(experienceTypes, eq(users.experience, experienceTypes.id))
      .groupBy(experienceTypes.experience)
      .orderBy(desc(sql`count(*)`));

    const experienceDistribution = experienceDistributionData.map((item) => ({
      experience: item.experience || "Unknown",
      count: item.count,
      percentage: (item.count / totalParticipants) * 100,
    }));

    // Marketing distribution using Drizzle
    const marketingDistributionData = await db
      .select({
        marketing: marketingTypes.marketing,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(users)
      .leftJoin(marketingTypes, eq(users.marketing, marketingTypes.id))
      .groupBy(marketingTypes.marketing)
      .orderBy(desc(sql`count(*)`));

    const marketingDistribution = marketingDistributionData.map((item) => ({
      marketing: item.marketing || "Unknown",
      count: item.count,
      percentage: (item.count / totalParticipants) * 100,
    }));

    // Dietary restrictions distribution
    const dietaryRestrictionsData = await db
      .select({
        restriction: dietaryRestrictions.restriction,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(userDietRestrictions)
      .leftJoin(
        dietaryRestrictions,
        eq(userDietRestrictions.restriction, dietaryRestrictions.id),
      )
      .groupBy(dietaryRestrictions.restriction)
      .orderBy(desc(sql`count(*)`));

    const dietaryRestrictionsDistribution = dietaryRestrictionsData.map(
      (item) => ({
        restriction: item.restriction || "Unknown",
        count: item.count,
        percentage: (item.count / totalParticipants) * 100,
      }),
    );

    // Interests distribution
    const interestsData = await db
      .select({
        interest: interests.interest,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(userInterests)
      .leftJoin(interests, eq(userInterests.interest, interests.id))
      .groupBy(interests.interest)
      .orderBy(desc(sql`count(*)`));

    const interestsDistribution = interestsData.map((item) => ({
      interest: item.interest || "Unknown",
      count: item.count,
      percentage: (item.count / totalParticipants) * 100,
    }));

    // Previous attendance calculated from basic stats
    const previousAttendance = {
      attended: attendedCount,
      notAttended: totalParticipants - attendedCount,
    };

    // Registration trends (last 30 days) using Drizzle
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const registrationTrendsData = await db
      .select({
        date: sql<string>`date(${users.timestamp})`.as("date"),
        count: sql<number>`count(*)`.as("count"),
      })
      .from(users)
      .where(sql`${users.timestamp} >= ${thirtyDaysAgo.toISOString()}`)
      .groupBy(sql`date(${users.timestamp})`)
      .orderBy(sql`date(${users.timestamp})`);

    const registrationTrends = registrationTrendsData.map((item) => ({
      date: item.date,
      count: item.count,
    }));

    // Calculate average registration time using Drizzle
    const averageRegistrationTimeData = await db
      .select({
        avgDays:
          sql<number>`avg(extract(epoch from (now() - ${users.timestamp})) / 86400)`.as(
            "avgDays",
          ),
      })
      .from(users)
      .where(sql`${users.timestamp} is not null`);

    const averageRegistrationTime = averageRegistrationTimeData[0]?.avgDays
      ? `${Math.round(averageRegistrationTimeData[0].avgDays)} days ago`
      : "N/A";

    const statsData = {
      totalParticipants,
      confirmedParticipants,
      pendingParticipants,
      waitlistedParticipants,
      checkedInParticipants,
      genderDistribution,
      universityDistribution,
      majorDistribution,
      yearOfStudyDistribution,
      experienceDistribution,
      marketingDistribution,
      dietaryRestrictionsDistribution,
      interestsDistribution,
      previousAttendance,
      registrationTrends,
      averageRegistrationTime,
    };

    return NextResponse.json(statsData);
  } catch (error) {
    console.error("Error fetching participant statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch participant statistics" },
      { status: 500 },
    );
  }
}
