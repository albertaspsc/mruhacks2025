import { db } from "@/db/drizzle";
import { workshopRegistrations } from "@/db/schema";
import { WorkshopRegistrationRepository } from "./types";
import { WorkshopRegistrationDTO } from "@/dto/workshopRegistration.dto";
import { eq, and } from "drizzle-orm";
import { DatabaseError } from "@/errors";
import { users, gender, universities, majors } from "@/db/schema";

// Simple logger helper to keep repository logs consistent
const repoLog = (message: string, meta?: any) =>
  console.debug(`[WorkshopRegistrationRepository] ${message}`, meta || "");

export class DrizzleWorkshopRegistrationRepository
  implements WorkshopRegistrationRepository
{
  async register(
    userId: string,
    workshopId: string,
  ): Promise<WorkshopRegistrationDTO> {
    try {
      repoLog("Attempting to register user to workshop", {
        userId,
        workshopId,
      });
      const [row] = await db
        .insert(workshopRegistrations)
        .values({
          userId,
          workshopId,
        })
        .returning();

      return {
        workshopId: row.workshopId,
        userId: row.userId,
        registeredAt: row.registeredAt.toISOString(),
      } as WorkshopRegistrationDTO;
    } catch (err: any) {
      console.error("Register error:", err);
      throw new DatabaseError("Failed to register user to workshop");
    }
  }

  async unregister(userId: string, workshopId: string): Promise<boolean> {
    try {
      repoLog("Attempting to unregister user from workshop", {
        userId,
        workshopId,
      });
      const result = await db
        .delete(workshopRegistrations)
        .where(
          and(
            eq(workshopRegistrations.userId, userId),
            eq(workshopRegistrations.workshopId, workshopId),
          ),
        )
        .returning();

      return result.length > 0;
    } catch (err: any) {
      console.error("Unregister error:", err);
      throw new DatabaseError("Failed to unregister user from workshop");
    }
  }

  async getUserRegistrations(
    userId: string,
  ): Promise<WorkshopRegistrationDTO[]> {
    try {
      const rows = await db
        .select()
        .from(workshopRegistrations)
        .where(eq(workshopRegistrations.userId, userId));
      return rows.map((r: any) => ({
        workshopId: r.workshopId,
        userId: r.userId,
        registeredAt: r.registeredAt.toISOString(),
      }));
    } catch (err: any) {
      console.error("GetUserRegistrations error:", err);
      throw new DatabaseError("Failed to fetch user registrations");
    }
  }

  async getWorkshopRegistrations(
    workshopId: string,
  ): Promise<WorkshopRegistrationDTO[]> {
    try {
      const rows = await db
        .select()
        .from(workshopRegistrations)
        .where(eq(workshopRegistrations.workshopId, workshopId));
      return rows.map((r: any) => ({
        workshopId: r.workshopId,
        userId: r.userId,
        registeredAt: r.registeredAt.toISOString(),
      }));
    } catch (err: any) {
      console.error("GetWorkshopRegistrations error:", err);
      throw new DatabaseError("Failed to fetch workshop registrations");
    }
  }

  /**
   * Get registrations for a workshop including participant display fields
   * used by admin/volunteer views.
   */
  async getWorkshopRegistrationsWithParticipantInfo(workshopId: string) {
    try {
      const rows = await db
        .select({
          id: workshopRegistrations.id,
          registeredAt: workshopRegistrations.registeredAt,
          fName: workshopRegistrations.fName,
          lName: workshopRegistrations.lName,
          yearOfStudy: workshopRegistrations.yearOfStudy,
          gender: workshopRegistrations.gender,
          major: workshopRegistrations.major,
          userId: workshopRegistrations.userId,
        })
        .from(workshopRegistrations)
        // join user profile text fields if available (data may also be denormalized)
        .leftJoin(users, eq(workshopRegistrations.userId, users.id))
        .leftJoin(gender, eq(users.gender, gender.id))
        .leftJoin(universities, eq(users.university, universities.id))
        .leftJoin(majors, eq(users.major, majors.id))
        .where(eq(workshopRegistrations.workshopId, workshopId))
        .orderBy(workshopRegistrations.registeredAt);

      return rows.map((r: any) => ({
        id: r.id,
        registeredAt: r.registeredAt,
        fName: r.fName || r.f_name || "",
        lName: r.lName || r.l_name || "",
        yearOfStudy: r.yearOfStudy,
        gender: r.gender,
        major: r.major,
        userId: r.userId,
      }));
    } catch (err: any) {
      console.error("GetWorkshopRegistrationsWithParticipantInfo error:", err);
      throw new DatabaseError(
        "Failed to fetch workshop registrations with participant info",
      );
    }
  }

  async isUserRegistered(userId: string, workshopId: string): Promise<boolean> {
    try {
      const rows = await db
        .select()
        .from(workshopRegistrations)
        .where(
          and(
            eq(workshopRegistrations.userId, userId),
            eq(workshopRegistrations.workshopId, workshopId),
          ),
        )
        .limit(1);
      return rows.length > 0;
    } catch (err: any) {
      console.error("IsUserRegistered error:", err);
      throw new DatabaseError("Failed to check registration status");
    }
  }

  async getRegistrationStatus(userId: string, workshopId: string) {
    const registered = await this.isUserRegistered(userId, workshopId);
    return {
      workshopId,
      isRegistered: registered,
      canRegister: !registered,
    };
  }
}

export const workshopRegistrationRepository =
  new DrizzleWorkshopRegistrationRepository();
