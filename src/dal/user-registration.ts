"use server";

import {
  UserRegistration,
  GenderOption,
  UniversityOption,
  MajorOption,
  InterestOption,
  DietaryRestrictionOption,
  MarketingTypeOption,
  ServiceResult,
} from "@/types/registration";
import { db } from "@/db/drizzle";
import {
  users,
  gender as genderTable,
  universities as universitiesTable,
  majors as majorsTable,
  interests as interestsTable,
  dietaryRestrictions as dietaryRestrictionsTable,
  marketingTypes as marketingTypesTable,
  userInterests as userInterestsTable,
  userDietRestrictions as userDietRestrictionsTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";

// User CRUD operations with transaction management

/**
 * Retrieves a user by their unique identifier.
 * @param userId - The unique identifier of the user to retrieve
 * @returns A service result containing the user data or null if not found
 */
export async function getUserById(
  userId: string,
): Promise<ServiceResult<UserRegistration | null>> {
  try {
    const row = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
    });
    if (!row) return { success: true, data: null };
    const mapped: UserRegistration = {
      id: row.id,
      email: row.email!,
      f_name: row.fName!,
      l_name: row.lName!,
      gender: row.gender!,
      university: row.university!,
      major: row.major!,
      yearOfStudy: row.yearOfStudy!,
      experience: row.experience!,
      marketing: row.marketing!,
      prev_attendance: row.prevAttendance!,
      parking: row.parking!,
      accommodations: row.accommodations!,
      resume_url: row.resumeUrl || undefined,
      resume_filename: row.resumeFilename || undefined,
      status: row.status!,
      checked_in: Boolean(row.checkedIn),
      timestamp: row.timestamp || undefined,
      updated_at: row.updatedAt || undefined,
    };
    return { success: true, data: mapped };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get user",
    };
  }
}

/**
 * Updates a user's information with the provided partial data.
 * @param userId - The unique identifier of the user to update
 * @param updates - Partial user data containing the fields to update
 * @returns A service result containing the updated user data
 */
export async function updateUser(
  userId: string,
  updates: Partial<UserRegistration>,
): Promise<ServiceResult<UserRegistration>> {
  try {
    return await db.transaction(async (tx) => {
      const mappedUpdates: any = {};
      if (updates.email !== undefined) mappedUpdates.email = updates.email;
      if (updates.f_name !== undefined) mappedUpdates.fName = updates.f_name;
      if (updates.l_name !== undefined) mappedUpdates.lName = updates.l_name;
      if (updates.gender !== undefined) mappedUpdates.gender = updates.gender;
      if (updates.university !== undefined)
        mappedUpdates.university = updates.university;
      if (updates.major !== undefined) mappedUpdates.major = updates.major;
      if (updates.yearOfStudy !== undefined)
        mappedUpdates.yearOfStudy = updates.yearOfStudy;
      if (updates.experience !== undefined)
        mappedUpdates.experience = updates.experience;
      if (updates.marketing !== undefined)
        mappedUpdates.marketing = updates.marketing;
      if (updates.prev_attendance !== undefined)
        mappedUpdates.prevAttendance = updates.prev_attendance;
      if (updates.parking !== undefined)
        mappedUpdates.parking = updates.parking;
      if (updates.accommodations !== undefined)
        mappedUpdates.accommodations = updates.accommodations;
      if (updates.resume_url !== undefined)
        mappedUpdates.resumeUrl = updates.resume_url;
      if (updates.resume_filename !== undefined)
        mappedUpdates.resumeFilename = updates.resume_filename;
      if (updates.status !== undefined) mappedUpdates.status = updates.status;
      if (updates.checked_in !== undefined)
        mappedUpdates.checkedIn = updates.checked_in;
      mappedUpdates.updatedAt = new Date().toISOString();

      const [row] = await tx
        .update(users)
        .set(mappedUpdates)
        .where(eq(users.id, userId))
        .returning();

      if (!row) return { success: false, error: "Failed to update user" };

      const mapped: UserRegistration = {
        id: row.id,
        email: row.email!,
        f_name: row.fName!,
        l_name: row.lName!,
        gender: row.gender!,
        university: row.university!,
        major: row.major!,
        yearOfStudy: row.yearOfStudy!,
        experience: row.experience!,
        marketing: row.marketing!,
        prev_attendance: row.prevAttendance!,
        parking: row.parking!,
        accommodations: row.accommodations!,
        resume_url: row.resumeUrl || undefined,
        resume_filename: row.resumeFilename || undefined,
        status: row.status!,
        checked_in: Boolean(row.checkedIn),
        timestamp: row.timestamp || undefined,
        updated_at: row.updatedAt || undefined,
      };
      return { success: true, data: mapped };
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user",
    };
  }
}

/**
 * Deletes a user from the database by their unique identifier.
 * @param userId - The unique identifier of the user to delete
 * @returns A service result indicating success or failure
 */
export async function deleteUser(userId: string): Promise<ServiceResult<void>> {
  try {
    await db.delete(users).where(eq(users.id, userId));
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete user",
    };
  }
}

// Lookup table operations

/**
 * Retrieves all available gender options from the database.
 * @returns A service result containing an array of gender options
 */
export async function getGenderOptions(): Promise<
  ServiceResult<GenderOption[]>
> {
  try {
    const rows = await db
      .select({ id: genderTable.id, gender: genderTable.gender })
      .from(genderTable)
      .orderBy(genderTable.id);
    return { success: true, data: rows as GenderOption[] };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get gender options",
    };
  }
}

/**
 * Retrieves all available university options from the database.
 * @returns A service result containing an array of university options
 */
export async function getUniversityOptions(): Promise<
  ServiceResult<UniversityOption[]>
> {
  try {
    const rows = await db
      .select({ id: universitiesTable.id, uni: universitiesTable.uni })
      .from(universitiesTable)
      .orderBy(universitiesTable.uni);
    return { success: true, data: rows as UniversityOption[] };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get university options",
    };
  }
}

/**
 * Retrieves all available major options from the database.
 * @returns A service result containing an array of major options
 */
export async function getMajorOptions(): Promise<ServiceResult<MajorOption[]>> {
  try {
    const rows = await db
      .select({ id: majorsTable.id, major: majorsTable.major })
      .from(majorsTable)
      .orderBy(majorsTable.major);
    return { success: true, data: rows as MajorOption[] };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get major options",
    };
  }
}

/**
 * Retrieves all available interest options from the database.
 * @returns A service result containing an array of interest options
 */
export async function getInterestOptions(): Promise<
  ServiceResult<InterestOption[]>
> {
  try {
    const rows = await db
      .select({ id: interestsTable.id, interest: interestsTable.interest })
      .from(interestsTable)
      .orderBy(interestsTable.interest);
    return { success: true, data: rows as InterestOption[] };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get interest options",
    };
  }
}

/**
 * Retrieves all available dietary restriction options from the database.
 * @returns A service result containing an array of dietary restriction options
 */
export async function getDietaryRestrictionOptions(): Promise<
  ServiceResult<DietaryRestrictionOption[]>
> {
  try {
    const rows = await db
      .select({
        id: dietaryRestrictionsTable.id,
        restriction: dietaryRestrictionsTable.restriction,
      })
      .from(dietaryRestrictionsTable)
      .orderBy(dietaryRestrictionsTable.restriction);
    return { success: true, data: rows as DietaryRestrictionOption[] };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get dietary restriction options",
    };
  }
}

/**
 * Retrieves all available marketing type options from the database.
 * @returns A service result containing an array of marketing type options
 */
export async function getMarketingTypeOptions(): Promise<
  ServiceResult<MarketingTypeOption[]>
> {
  try {
    const rows = await db
      .select({
        id: marketingTypesTable.id,
        marketing: marketingTypesTable.marketing,
      })
      .from(marketingTypesTable)
      .orderBy(marketingTypesTable.marketing);
    return { success: true, data: rows as MarketingTypeOption[] };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get marketing type options",
    };
  }
}

/**
 * Creates a new user with their registration data, interests, and dietary restrictions.
 * @param userId - The unique identifier for the new user
 * @param userData - The user registration data excluding the ID
 * @param interestIds - Array of interest IDs to associate with the user
 * @param dietaryRestrictionIds - Array of dietary restriction IDs to associate with the user
 * @returns A service result containing the created user data
 */
export async function createUser(
  userId: string,
  userData: Omit<UserRegistration, "id">,
  interestIds: number[] = [],
  dietaryRestrictionIds: number[] = [],
): Promise<ServiceResult<UserRegistration>> {
  try {
    return await db.transaction(async (tx) => {
      // Create user record
      const insertValues: any = {
        id: userId,
        email: userData.email,
        fName: userData.f_name,
        lName: userData.l_name,
        gender: userData.gender,
        university: userData.university,
        major: userData.major,
        yearOfStudy: userData.yearOfStudy,
        experience: userData.experience,
        marketing: userData.marketing,
        prevAttendance: userData.prev_attendance,
        parking: userData.parking,
        accommodations: userData.accommodations,
        resumeUrl: userData.resume_url,
        status: userData.status,
        checkedIn: userData.checked_in,
        timestamp: userData.timestamp,
        updatedAt: userData.updated_at,
        resumeFilename: userData.resume_filename,
      };

      const [row] = await tx.insert(users).values(insertValues).returning();
      if (!row) return { success: false, error: "Failed to create user" };

      // Set user interests if provided
      if (interestIds.length > 0) {
        await tx.insert(userInterestsTable).values(
          interestIds.map((interestId) => ({
            id: userId,
            interest: interestId,
          })),
        );
      }

      // Set user dietary restrictions if provided
      if (dietaryRestrictionIds.length > 0) {
        await tx.insert(userDietRestrictionsTable).values(
          dietaryRestrictionIds.map((restrictionId) => ({
            id: userId,
            restriction: restrictionId,
          })),
        );
      }

      // Map and return the created user
      const mapped: UserRegistration = {
        id: row.id,
        email: row.email!,
        f_name: row.fName!,
        l_name: row.lName!,
        gender: row.gender!,
        university: row.university!,
        major: row.major!,
        yearOfStudy: row.yearOfStudy!,
        experience: row.experience!,
        marketing: row.marketing!,
        prev_attendance: row.prevAttendance!,
        parking: row.parking!,
        accommodations: row.accommodations!,
        resume_url: row.resumeUrl || undefined,
        resume_filename: row.resumeFilename || undefined,
        status: row.status!,
        checked_in: Boolean(row.checkedIn),
        timestamp: row.timestamp || undefined,
        updated_at: row.updatedAt || undefined,
      };

      return { success: true, data: mapped };
    });
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create user with interests and dietary restrictions",
    };
  }
}

/**
 * Sets the interests for a specific user, replacing any existing interests.
 * @param userId - The unique identifier of the user
 * @param interestIds - Array of interest IDs to associate with the user
 * @returns A service result indicating success or failure
 */
export async function setUserInterests(
  userId: string,
  interestIds: number[],
): Promise<ServiceResult<void>> {
  try {
    return await db.transaction(async (tx) => {
      // Delete existing interests
      await tx
        .delete(userInterestsTable)
        .where(eq(userInterestsTable.id, userId));
      // Insert new interests
      if (interestIds.length > 0) {
        await tx.insert(userInterestsTable).values(
          interestIds.map((interestId) => ({
            id: userId,
            interest: interestId,
          })),
        );
      }
      return { success: true };
    });
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to set user interests",
    };
  }
}

/**
 * Sets the dietary restrictions for a specific user, replacing any existing restrictions.
 * @param userId - The unique identifier of the user
 * @param restrictionIds - Array of dietary restriction IDs to associate with the user
 * @returns A service result indicating success or failure
 */
export async function setUserDietaryRestrictions(
  userId: string,
  restrictionIds: number[],
): Promise<ServiceResult<void>> {
  try {
    return await db.transaction(async (tx) => {
      await tx
        .delete(userDietRestrictionsTable)
        .where(eq(userDietRestrictionsTable.id, userId));
      if (restrictionIds.length > 0) {
        await tx.insert(userDietRestrictionsTable).values(
          restrictionIds.map((restrictionId) => ({
            id: userId,
            restriction: restrictionId,
          })),
        );
      }
      return { success: true };
    });
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to set user dietary restrictions",
    };
  }
}

/**
 * Retrieves all interests associated with a specific user.
 * @param userId - The unique identifier of the user
 * @returns A service result containing an array of the user's interests
 */
export async function getUserInterests(
  userId: string,
): Promise<ServiceResult<InterestOption[]>> {
  try {
    const rows = await db
      .select({
        id: interestsTable.id,
        interest: interestsTable.interest,
      })
      .from(userInterestsTable)
      .innerJoin(
        interestsTable,
        eq(userInterestsTable.interest, interestsTable.id),
      )
      .where(eq(userInterestsTable.id, userId));
    return { success: true, data: rows as InterestOption[] };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get user interests",
    };
  }
}

/**
 * Retrieves all dietary restrictions associated with a specific user.
 * @param userId - The unique identifier of the user
 * @returns A service result containing an array of the user's dietary restrictions
 */
export async function getUserDietaryRestrictions(
  userId: string,
): Promise<ServiceResult<DietaryRestrictionOption[]>> {
  try {
    const rows = await db
      .select({
        id: dietaryRestrictionsTable.id,
        restriction: dietaryRestrictionsTable.restriction,
      })
      .from(userDietRestrictionsTable)
      .innerJoin(
        dietaryRestrictionsTable,
        eq(userDietRestrictionsTable.restriction, dietaryRestrictionsTable.id),
      )
      .where(eq(userDietRestrictionsTable.id, userId));
    return { success: true, data: rows as DietaryRestrictionOption[] };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get user dietary restrictions",
    };
  }
}
