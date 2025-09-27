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
import { eq, desc, sql, and, isNull } from "drizzle-orm";
import { lookupTables } from "@/data/lookup-tables";

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

    // Check if there are any participants (excluding admin users)
    const participantCount = await db
      .select({ count: sql<number>`count(*)`.as("count") })
      .from(users)
      .leftJoin(admins, eq(users.id, admins.id))
      .where(isNull(admins.id));

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

    // Calculate basic statistics using Drizzle (excluding admin users)
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
      .from(users)
      .leftJoin(admins, eq(users.id, admins.id))
      .where(isNull(admins.id));

    const {
      totalParticipants,
      confirmedParticipants,
      pendingParticipants,
      waitlistedParticipants,
      checkedInParticipants,
      previousAttendance: attendedCount,
    } = basicStats[0];

    // Gender distribution using Drizzle (excluding admin users)
    const genderDistributionData = await db
      .select({
        genderId: users.gender,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(users)
      .leftJoin(admins, eq(users.id, admins.id))
      .where(isNull(admins.id))
      .groupBy(users.gender)
      .orderBy(desc(sql`count(*)`));

    const genderDistribution = genderDistributionData.map((item) => {
      const genderOption = lookupTables.genders.find(
        (g) => g.id === item.genderId,
      );
      return {
        gender: genderOption?.gender || "Unknown",
        count: item.count,
        percentage: (item.count / totalParticipants) * 100,
      };
    });

    // University distribution using Drizzle (excluding admin users)
    const universityDistributionData = await db
      .select({
        universityId: users.university,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(users)
      .leftJoin(admins, eq(users.id, admins.id))
      .where(isNull(admins.id))
      .groupBy(users.university)
      .orderBy(desc(sql`count(*)`));

    const universityDistribution = universityDistributionData.map((item) => {
      const universityOption = lookupTables.universities.find(
        (u) => u.id === item.universityId,
      );
      return {
        university: universityOption?.uni || "Unknown",
        count: item.count,
        percentage: (item.count / totalParticipants) * 100,
      };
    });

    // Major distribution using Drizzle (excluding admin users)
    const majorDistributionData = await db
      .select({
        majorId: users.major,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(users)
      .leftJoin(admins, eq(users.id, admins.id))
      .where(isNull(admins.id))
      .groupBy(users.major)
      .orderBy(desc(sql`count(*)`));

    const majorDistribution = majorDistributionData.map((item) => {
      const majorOption = lookupTables.majors.find(
        (m) => m.id === item.majorId,
      );
      return {
        major: majorOption?.major || "Unknown",
        count: item.count,
        percentage: (item.count / totalParticipants) * 100,
      };
    });

    // Year of study distribution using Drizzle (excluding admin users)
    const yearOfStudyDistributionData = await db
      .select({
        year: users.yearOfStudy,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(users)
      .leftJoin(admins, eq(users.id, admins.id))
      .where(isNull(admins.id))
      .groupBy(users.yearOfStudy)
      .orderBy(desc(sql`count(*)`));

    const yearOfStudyDistribution = yearOfStudyDistributionData.map((item) => ({
      year: item.year || "Unknown",
      count: item.count,
      percentage: (item.count / totalParticipants) * 100,
    }));

    // Experience level distribution using Drizzle (excluding admin users)
    const experienceDistributionData = await db
      .select({
        experienceId: users.experience,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(users)
      .leftJoin(admins, eq(users.id, admins.id))
      .where(isNull(admins.id))
      .groupBy(users.experience)
      .orderBy(desc(sql`count(*)`));

    const experienceDistribution = experienceDistributionData.map((item) => {
      const experienceOption = lookupTables.experienceTypes.find(
        (e) => e.id === item.experienceId,
      );
      return {
        experience: experienceOption?.experience || "Unknown",
        count: item.count,
        percentage: (item.count / totalParticipants) * 100,
      };
    });

    // Marketing distribution using Drizzle (excluding admin users)
    const marketingDistributionData = await db
      .select({
        marketingId: users.marketing,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(users)
      .leftJoin(admins, eq(users.id, admins.id))
      .where(isNull(admins.id))
      .groupBy(users.marketing)
      .orderBy(desc(sql`count(*)`));

    const marketingDistribution = marketingDistributionData.map((item) => {
      const marketingOption = lookupTables.marketingTypes.find(
        (m) => m.id === item.marketingId,
      );
      return {
        marketing: marketingOption?.marketing || "Unknown",
        count: item.count,
        percentage: (item.count / totalParticipants) * 100,
      };
    });

    // Dietary restrictions distribution
    const dietaryRestrictionsData = await db
      .select({
        restrictionId: userDietRestrictions.restriction,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(userDietRestrictions)
      .groupBy(userDietRestrictions.restriction)
      .orderBy(desc(sql`count(*)`));

    const dietaryRestrictionsDistribution = dietaryRestrictionsData.map(
      (item) => {
        const restrictionOption = lookupTables.dietaryRestrictions.find(
          (d) => d.id === item.restrictionId,
        );
        return {
          restriction: restrictionOption?.restriction || "Unknown",
          count: item.count,
          percentage: (item.count / totalParticipants) * 100,
        };
      },
    );

    // Interests distribution
    const interestsData = await db
      .select({
        interestId: userInterests.interest,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(userInterests)
      .groupBy(userInterests.interest)
      .orderBy(desc(sql`count(*)`));

    const interestsDistribution = interestsData.map((item) => {
      const interestOption = lookupTables.interests.find(
        (i) => i.id === item.interestId,
      );
      return {
        interest: interestOption?.interest || "Unknown",
        count: item.count,
        percentage: (item.count / totalParticipants) * 100,
      };
    });

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
      .leftJoin(admins, eq(users.id, admins.id))
      .where(
        and(
          sql`${users.timestamp} >= ${thirtyDaysAgo.toISOString()}`,
          isNull(admins.id),
        ),
      )
      .groupBy(sql`date(${users.timestamp})`)
      .orderBy(sql`date(${users.timestamp})`);

    const registrationTrends = registrationTrendsData.map((item) => ({
      date: item.date,
      count: item.count,
    }));

    // Calculate average registration time using Drizzle (excluding admin users)
    const averageRegistrationTimeData = await db
      .select({
        avgDays:
          sql<number>`avg(extract(epoch from (now() - ${users.timestamp})) / 86400)`.as(
            "avgDays",
          ),
      })
      .from(users)
      .leftJoin(admins, eq(users.id, admins.id))
      .where(and(sql`${users.timestamp} is not null`, isNull(admins.id)));

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
