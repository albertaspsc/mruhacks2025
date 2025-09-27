import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db/drizzle";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";

interface RemoveAdminRequest {
  participantId: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if current user is an admin
    const adminCheck = await db
      .select()
      .from(admins)
      .where(eq(admins.id, user.id));

    if (adminCheck.length === 0) {
      return NextResponse.json(
        { error: "Admin privileges required" },
        { status: 403 },
      );
    }

    const currentAdmin = adminCheck[0];

    // Only allow admins and super_admins to remove admin privileges
    if (currentAdmin.role !== "admin" && currentAdmin.role !== "super_admin") {
      return NextResponse.json(
        { error: "Insufficient privileges to remove admin privileges" },
        { status: 403 },
      );
    }

    const body: RemoveAdminRequest = await request.json();
    const { participantId } = body;

    // Only super_admins can remove other super_admins
    if (currentAdmin.role !== "super_admin") {
      const targetAdmin = await db
        .select()
        .from(admins)
        .where(eq(admins.id, participantId));

      if (targetAdmin.length > 0 && targetAdmin[0].role === "super_admin") {
        return NextResponse.json(
          { error: "Only super admins can remove other super admins" },
          { status: 403 },
        );
      }
    }

    // Prevent users from removing themselves
    if (user.id === participantId) {
      return NextResponse.json(
        { error: "You cannot remove your own admin privileges" },
        { status: 400 },
      );
    }

    // Validate required fields
    if (!participantId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if admin exists
    const existingAdmin = await db
      .select()
      .from(admins)
      .where(eq(admins.id, participantId));

    if (existingAdmin.length === 0) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // Remove admin record
    await db.delete(admins).where(eq(admins.id, participantId));

    return NextResponse.json({
      success: true,
      message: "Admin privileges removed successfully",
    });
  } catch (error) {
    console.error("Error removing admin privileges:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
