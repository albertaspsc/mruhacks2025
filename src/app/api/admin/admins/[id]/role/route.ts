import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db/drizzle";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";

type AdminRole = "admin" | "super_admin" | "volunteer";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: targetAdminId } = await context.params;

    // Parse request body
    let body: { role?: AdminRole };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const newRole = body.role as AdminRole | undefined;
    if (!newRole || !["admin", "super_admin", "volunteer"].includes(newRole)) {
      return NextResponse.json(
        { error: "Invalid or missing role" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch requesting admin's privileges
    const requestingAdmin = await db
      .select()
      .from(admins)
      .where(eq(admins.id, user.id));

    if (requestingAdmin.length === 0) {
      return NextResponse.json(
        { error: "Admin privileges required" },
        { status: 403 },
      );
    }

    const requester = requestingAdmin[0];
    if (requester.status !== "active") {
      return NextResponse.json(
        { error: "Admin account inactive" },
        { status: 403 },
      );
    }

    // Authorization rules
    // - super_admin can set any role
    // - admin can set only admin|volunteer (cannot set super_admin)
    if (requester.role === "admin" && newRole === "super_admin") {
      return NextResponse.json(
        { error: "Only super admins can assign the super_admin role" },
        { status: 403 },
      );
    }

    // Ensure target admin exists
    const existingTarget = await db
      .select()
      .from(admins)
      .where(eq(admins.id, targetAdminId));

    if (existingTarget.length === 0) {
      return NextResponse.json(
        { error: "Target admin not found" },
        { status: 404 },
      );
    }

    // Optional: prevent users from changing their own role to avoid lockouts
    // (Allow super_admin to change own role if desired. Here we allow both.)

    // Apply update
    const updated = await db
      .update(admins)
      .set({ role: newRole, updatedAt: new Date().toISOString() })
      .where(eq(admins.id, targetAdminId))
      .returning();

    return NextResponse.json({ success: true, admin: updated[0] });
  } catch (error) {
    console.error("Error updating admin role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
