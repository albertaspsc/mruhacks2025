import { db } from "@/db/drizzle";
import { profile } from "@/db/schema";
import { UserProfileDTO } from "@/dto/user.dto";
import { eq } from "drizzle-orm";

export class DrizzleProfileRepository {
  async getById(id: string): Promise<UserProfileDTO | null> {
    const [row] = await db
      .select()
      .from(profile)
      .where(eq(profile.id, id))
      .limit(1);
    if (!row) return null;
    return {
      id: row.id,
      fName: row.fName,
      lName: row.lName,
      email: row.email,
      university: (row as any).university || "",
      major: (row as any).major || "",
      yearOfStudy: (row as any).yearOfStudy || "",
      experience: (row as any).experience || "",
    } as UserProfileDTO;
  }
}

export const profileRepository = new DrizzleProfileRepository();
