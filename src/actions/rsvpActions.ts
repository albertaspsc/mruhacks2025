"use server";

/**
 * RSVP server actions for user registration flow.
 *
 * This module handles RSVP confirmation, rescinding, and first-come/first-serve
 * (FCFS) registration logic. It uses Supabase authentication, Drizzle ORM, and
 * Next.js server actions to ensure that only authenticated users can confirm
 * or rescind their RSVP status.
 *
 * Functions:
 * - fcsfRsvp(): FCFS registration respecting a maximum capacity.
 * - confirmRsvp(): Confirms RSVP if user is explicitly eligible.
 * - rescindRsvp(): Rescinds RSVP by marking the user as declined.
 */

import { db } from "@/db/drizzle";
import { rsvpableUsers, users } from "@/db/schema";
import { ServiceResult } from "@/types/registration";
import { confirmedCount } from "@/utils/migrations/schema";
import { createClient } from "@/utils/supabase/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

const CAPACITY = 150;

/**
 * Attempts to register the authenticated user for the event on a
 * first-come/first-serve (FCFS) basis.
 *
 * - Checks Supabase authentication for the current user.
 * - Queries the confirmed RSVP count against the event capacity.
 * - If capacity has not been exceeded, updates the user's status to "confirmed".
 *
 * @returns {Promise<ServiceResult>} Success or failure state with optional message.
 */
export async function fcsfRsvp(): Promise<ServiceResult> {
  try {
    const client = await createClient();
    const { data: userData, error: userError } = await client.auth.getUser();

    if (!userData || userError)
      return {
        success: false,
        message: "Failed to retrieve user",
      };

    const userId = userData.user.id;

    return await db.transaction(async (tx) => {
      const [{ count }] = await tx
        .select({ count: confirmedCount.count })
        .from(confirmedCount);

      if (count >= CAPACITY)
        return { success: false, message: "Max Registration Count Reached" };

      await tx
        .update(users)
        .set({ status: "confirmed" })
        .where(eq(users.id, userId));

      return { success: true };
    });
  } catch (e) {
    console.error(e);
    return { success: false, message: "Failed to RSVP" };
  }
}

/**
 * Rescinds the RSVP for the authenticated user by updating their status to "declined".
 *
 * - Ensures the user is authenticated via Supabase.
 * - Updates their RSVP status in the `users` table.
 * - Redirects back to the user dashboard.
 */
export async function confirmRsvp(): Promise<ServiceResult> {
  try {
    const client = await createClient();
    const { data: userData, error: userError } = await client.auth.getUser();

    if (!userData || userError) {
      throw new Error("Failed to retrieve user");
    }

    const userId = userData.user.id;

    // Check rsvpable_users via Drizzle
    const rsvpable = await db
      .select({ id: rsvpableUsers.id })
      .from(rsvpableUsers)
      .where(eq(rsvpableUsers.id, userId))
      .limit(1);

    if (rsvpable.length === 0) {
      throw new Error("User is not in RSVP table");
    }

    // Update user status
    await db
      .update(users)
      .set({ status: "confirmed" })
      .where(eq(users.id, userId));

    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Failed to RSVP" };
  }
}

/**
 * Rescinds the RSVP for the authenticated user by updating their status to "declined".
 *
 * - Ensures the user is authenticated via Supabase.
 * - Updates their RSVP status in the `users` table.
 * - Redirects back to the user dashboard.
 */
export async function rescindRsvp(): Promise<ServiceResult> {
  try {
    const client = await createClient();
    const { data: userData, error: userError } = await client.auth.getUser();

    if (!userData || userError) {
      throw new Error("Failed to retrieve user");
    }

    const userId = userData.user.id;

    await db
      .update(users)
      .set({ status: "declined" })
      .where(eq(users.id, userId));

    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Failed to rescind RSVP" };
  }
}
