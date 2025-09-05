import { db } from "@/db/drizzle";
import {
  users,
  gender,
  universities,
  majors,
  experienceTypes,
} from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { UserDTO, UserBasicDTO, UserProfileDTO } from "@/dto/user.dto";
import { UserRepository } from "./types";

/**
 * Drizzle-backed UserRepository implementation
 */
export class DrizzleUserRepository implements UserRepository {
  async getById(id: string): Promise<UserDTO | null> {
    const [row] = await db
      .select({
        id: users.id,
        fName: users.fName,
        lName: users.lName,
        email: users.email,
        university: universities.uni,
        status: users.status,
        checkedIn: users.checkedIn,
        timestamp: users.timestamp,
        gender: gender.gender,
        prevAttendance: users.prevAttendance,
        major: majors.major,
        parking: users.parking,
        yearOfStudy: users.yearOfStudy,
        experience: experienceTypes.experience,
        accommodations: users.accommodations,
        marketing: users.marketing,
        resumeUrl: users.resumeUrl,
        resumeFilename: users.resumeFilename,
      })
      .from(users)
      .leftJoin(gender, eq(users.gender, gender.id))
      .leftJoin(universities, eq(users.university, universities.id))
      .leftJoin(majors, eq(users.major, majors.id))
      .leftJoin(experienceTypes, eq(users.experience, experienceTypes.id))
      .where(eq(users.id, id))
      .limit(1);

    if (!row) return null;

    const dto: UserDTO = {
      id: row.id,
      fName: row.fName,
      lName: row.lName,
      email: row.email,
      timestamp: row.timestamp
        ? new Date(row.timestamp).toISOString()
        : new Date().toISOString(),
      status: row.status,
      university: row.university || "N/A",
      checkedIn: !!row.checkedIn,
      gender: row.gender || "Not specified",
      prevAttendance: !!row.prevAttendance,
      major: row.major || "N/A",
      parking: row.parking,
      yearOfStudy: row.yearOfStudy,
      experience: row.experience || "N/A",
      accommodations: row.accommodations,
      marketing: row.marketing,
      resumeUrl: row.resumeUrl || undefined,
      resumeFilename: row.resumeFilename || undefined,
    };

    return dto;
  }

  async getBasicById(id: string): Promise<UserBasicDTO | null> {
    const [row] = await db
      .select({
        id: users.id,
        fName: users.fName,
        lName: users.lName,
        university: universities.uni,
        status: users.status,
        checkedIn: users.checkedIn,
        gender: gender.gender,
      })
      .from(users)
      .leftJoin(gender, eq(users.gender, gender.id))
      .leftJoin(universities, eq(users.university, universities.id))
      .where(eq(users.id, id))
      .limit(1);

    if (!row) return null;

    const dto: UserBasicDTO = {
      id: row.id,
      fName: row.fName,
      lName: row.lName,
      university: row.university || "N/A",
      status: row.status,
      checkedIn: !!row.checkedIn,
      gender: row.gender || "Not specified",
    };

    return dto;
  }

  async getProfileById(id: string): Promise<UserProfileDTO | null> {
    // profile table mirrors some public fields - use schema import for type-safe query
    const { profile } = await import("@/db/schema");
    const [row] = await db
      .select()
      .from(profile)
      .where(eq(profile.id, id))
      .limit(1);
    if (!row) return null;
    const dto: any = {
      id: row.id,
      fName: row.fName,
      lName: row.lName,
      email: row.email,
      university: (row as any).university || "",
      major: (row as any).major || "",
      yearOfStudy: (row as any).yearOfStudy || "",
      experience: (row as any).experience || "",
    };
    return dto as UserProfileDTO;
  }

  async list(limit = 100, offset = 0): Promise<UserDTO[]> {
    const rows = await db
      .select({
        id: users.id,
        fName: users.fName,
        lName: users.lName,
        email: users.email,
        university: universities.uni,
        status: users.status,
        checkedIn: users.checkedIn,
        timestamp: users.timestamp,
        gender: gender.gender,
        prevAttendance: users.prevAttendance,
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
      .limit(limit)
      .offset(offset);

    return rows.map((row: any) => ({
      id: row.id,
      fName: row.fName,
      lName: row.lName,
      email: row.email,
      timestamp: row.timestamp
        ? new Date(row.timestamp).toISOString()
        : new Date().toISOString(),
      status: row.status,
      university: row.university || "N/A",
      checkedIn: !!row.checkedIn,
      gender: row.gender || "Not specified",
      prevAttendance: !!row.prevAttendance,
      major: row.major || "N/A",
      parking: row.parking,
      yearOfStudy: row.yearOfStudy,
      experience: row.experience || "N/A",
      accommodations: row.accommodations,
      marketing: row.marketing,
      resumeUrl: row.resumeUrl || undefined,
      resumeFilename: row.resumeFilename || undefined,
    }));
  }

  async listBasic(limit = 100, offset = 0): Promise<UserBasicDTO[]> {
    const rows = await db
      .select({
        id: users.id,
        fName: users.fName,
        lName: users.lName,
        university: universities.uni,
        status: users.status,
        checkedIn: users.checkedIn,
        gender: gender.gender,
      })
      .from(users)
      .leftJoin(gender, eq(users.gender, gender.id))
      .leftJoin(universities, eq(users.university, universities.id))
      .orderBy(desc(users.timestamp))
      .limit(limit)
      .offset(offset);

    return rows.map((row: any) => ({
      id: row.id,
      fName: row.fName,
      lName: row.lName,
      university: row.university || "N/A",
      status: row.status,
      checkedIn: !!row.checkedIn,
      gender: row.gender || "Not specified",
    }));
  }

  async update(id: string, updates: Partial<UserDTO>): Promise<UserDTO | null> {
    const updateData: any = {};
    if (updates.fName !== undefined) updateData.f_name = updates.fName;
    if (updates.lName !== undefined) updateData.l_name = updates.lName;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.parking !== undefined) updateData.parking = updates.parking;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.checkedIn !== undefined)
      updateData.checked_in = updates.checkedIn;

    if (Object.keys(updateData).length === 0) return this.getById(id);

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    if (!updated) return null;

    return this.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });
    return result.length > 0;
  }

  // Convenience: update many in a transaction (used by bulk-update route)
  async updateMany(ids: string[], updateData: any) {
    return await db.transaction(async (tx) => {
      const updated = await tx
        .update(users)
        .set(updateData)
        .where(inArray(users.id, ids))
        .returning();
      return updated;
    });
  }

  async getByIds(ids: string[]) {
    const rows = await db
      .select({
        id: users.id,
        fName: users.fName,
        lName: users.lName,
        email: users.email,
        university: universities.uni,
        status: users.status,
        checkedIn: users.checkedIn,
        timestamp: users.timestamp,
      })
      .from(users)
      .leftJoin(universities, eq(users.university, universities.id))
      .where(inArray(users.id, ids));

    return rows.map((r: any) => ({
      id: r.id,
      fName: r.fName,
      lName: r.lName,
      email: r.email,
      university: r.university || "N/A",
      status: r.status,
      checkedIn: !!r.checkedIn,
      timestamp: r.timestamp
        ? new Date(r.timestamp).toISOString()
        : new Date().toISOString(),
    }));
  }

  async deleteMany(ids: string[]) {
    const result = await db
      .delete(users)
      .where(inArray(users.id, ids))
      .returning({ id: users.id });
    return result.length;
  }
}

export const userRepository = new DrizzleUserRepository();
