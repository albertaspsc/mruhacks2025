import { db } from "@/db/drizzle";
import { mktgPreferences, parkingInfo, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SettingsRepository } from "@/dal/types";
import {
  ParkingPreferencesDTO,
  MarketingPreferencesDTO,
} from "@/dto/settings.dto";
import { DatabaseError } from "@/errors";

// Simple logger for settings repo
const repoLog = (message: string, meta?: any) =>
  console.debug(`[SettingsRepository] ${message}`, meta || "");

export class DrizzleSettingsRepository implements SettingsRepository {
  async getParkingPreferences(userId: string) {
    try {
      repoLog("Fetching parking preferences for user", userId);
      const rows = await db
        .select()
        .from(users)
        .leftJoin(parkingInfo, eq(parkingInfo.id, users.id))
        .where(eq(users.id, userId));

      const userRow: any = (rows && rows[0]) || null;

      return {
        parkingPreference: userRow ? userRow.parking || "Not sure" : "Not sure",
        licensePlate: userRow ? userRow.license_plate || "" : "",
      } as ParkingPreferencesDTO;
    } catch (err: any) {
      console.error("getParkingPreferences error:", err);
      throw new DatabaseError("Failed to fetch parking preferences");
    }
  }

  async updateParkingPreferences(
    userId: string,
    preferences: ParkingPreferencesDTO,
  ) {
    try {
      repoLog("Updating parking preferences for user", { userId, preferences });

      await db
        .update(users)
        .set({ parking: preferences.parkingPreference })
        .where(eq(users.id, userId));

      if (preferences.parkingPreference === "Yes" && preferences.licensePlate) {
        await db
          .insert(parkingInfo)
          .values({ id: userId, licensePlate: preferences.licensePlate })
          .onConflictDoUpdate({
            target: parkingInfo.id,
            set: { licensePlate: preferences.licensePlate },
          });
      } else {
        await db.delete(parkingInfo).where(eq(parkingInfo.id, userId));
      }
    } catch (err: any) {
      console.error("updateParkingPreferences error:", err);
      throw new DatabaseError("Failed to update parking preferences");
    }
  }

  async getMarketingPreferences(userId: string) {
    try {
      repoLog("Fetching marketing preferences for user", userId);
      const rows = await db
        .select()
        .from(mktgPreferences)
        .where(eq(mktgPreferences.id, userId));
      const row: any = (rows && rows[0]) || null;

      if (!row) {
        // default true
        return { sendEmails: true } as MarketingPreferencesDTO;
      }

      return { sendEmails: row.send_emails } as MarketingPreferencesDTO;
    } catch (err: any) {
      console.error("getMarketingPreferences error:", err);
      throw new DatabaseError("Failed to fetch marketing preferences");
    }
  }

  async updateMarketingPreferences(
    userId: string,
    preferences: MarketingPreferencesDTO,
  ) {
    try {
      repoLog("Updating marketing preferences for user", {
        userId,
        preferences,
      });
      await db
        .insert(mktgPreferences)
        .values({ id: userId, sendEmails: preferences.sendEmails })
        .onConflictDoUpdate({
          target: mktgPreferences.id,
          set: { sendEmails: preferences.sendEmails },
        });
    } catch (err: any) {
      console.error("updateMarketingPreferences error:", err);
      throw new DatabaseError("Failed to update marketing preferences");
    }
  }

  async getUserSettings(userId: string) {
    const parking = await this.getParkingPreferences(userId);
    const marketing = await this.getMarketingPreferences(userId);
    return { parking, marketing } as any;
  }
}

export const settingsRepository = new DrizzleSettingsRepository();
