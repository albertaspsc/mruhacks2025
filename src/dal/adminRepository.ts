import { db } from "@/db/drizzle";
import { admins, profiles as profilesTable, users } from "@/db/schema";
import { AdminRepository } from "./types";
import { UserDTO } from "@/dto/user.dto";
import { eq, sql } from "drizzle-orm";
import { DatabaseError } from "@/errors";

/**
 * Drizzle-based implementation of AdminRepository
 */
export class DrizzleAdminRepository implements AdminRepository {
  async isAdmin(userId: string): Promise<boolean> {
    try {
      const rows = await db.select().from(admins).where(eq(admins.id, userId));
      return rows.length > 0;
    } catch (err: any) {
      console.error("isAdmin error:", err);
      throw new DatabaseError("Failed to check admin status");
    }
  }

  async listUsers(): Promise<UserDTO[]> {
    try {
      const rows: any[] = await db
        .select()
        .from(profilesTable)
        .innerJoin(users, eq(users.id, profilesTable.id));

      return rows.map((r: any) => {
        const profile = r.profile || {};
        const user = r.users || {};

        return {
          id: user.id || profile.id,
          email: user.email || profile.email,
          fName: user.fName || profile.fName || "",
          lName: user.lName || profile.lName || "",
          timestamp: user.timestamp ? String(user.timestamp) : "",
          prevAttendance: Boolean(user.prevAttendance),
          major: String(user.major || ""),
          parking: user.parking,
          yearOfStudy: String(user.yearOfStudy || ""),
          experience: String(user.experience || ""),
          accommodations: user.accommodations || "",
          marketing: user.marketing,
          resumeUrl: user.resumeUrl || undefined,
          resumeFilename: user.resumeFilename || undefined,
          status: user.status,
          checkedIn: Boolean(user.checkedIn),
          gender: String(user.gender || ""),
          university: String(user.university || ""),
        } as UserDTO;
      });
    } catch (err: any) {
      console.error("listUsers error:", err);
      throw new DatabaseError("Failed to list users");
    }
  }

  async grantAdmin(email: string) {
    try {
      await db.insert(admins).select(
        db
          .select({
            id: profilesTable.id,
            email: profilesTable.email,
            status: sql<string>`pending`.as("status"),
          })
          .from(profilesTable)
          .where(eq(profilesTable.email, email)),
      );
    } catch (err: any) {
      console.error("grantAdmin error:", err);
      throw new DatabaseError("Failed to grant admin");
    }
  }

  async revokeAdmin(userId: string) {
    try {
      await db.delete(admins).where(eq(admins.id, userId));
    } catch (err: any) {
      console.error("revokeAdmin error:", err);
      throw new DatabaseError("Failed to revoke admin");
    }
  }
}

export const adminRepository = new DrizzleAdminRepository();
