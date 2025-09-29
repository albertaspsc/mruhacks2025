import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db/drizzle";
import { admins, users } from "@/db/schema";
import { eq } from "drizzle-orm";

interface PromoteUserRequest {
  participantId: string;
  adminData: {
    role: "admin" | "super_admin" | "volunteer";
    status: "active" | "inactive";
    fName: string;
    lName: string;
    email: string;
  };
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

    // Only allow admins and super_admins to promote users
    if (currentAdmin.role !== "admin" && currentAdmin.role !== "super_admin") {
      return NextResponse.json(
        { error: "Insufficient privileges to promote users" },
        { status: 403 },
      );
    }

    const body: PromoteUserRequest = await request.json();

    // Only super_admins can promote to super_admin
    if (currentAdmin.role !== "super_admin" && currentAdmin.role === "admin") {
      // Regular admins can only promote to volunteer or admin, not super_admin
      if (body.adminData.role === "super_admin") {
        return NextResponse.json(
          { error: "Only super admins can promote users to super admin" },
          { status: 403 },
        );
      }
    }
    const { participantId, adminData } = body;

    // Validate required fields
    if (
      !participantId ||
      !adminData.email ||
      !adminData.fName ||
      !adminData.lName
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if participant exists
    const participant = await db
      .select()
      .from(users)
      .where(eq(users.id, participantId));

    if (participant.length === 0) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 },
      );
    }

    // Check if user is already an admin
    const existingAdmin = await db
      .select()
      .from(admins)
      .where(eq(admins.id, participantId));

    if (existingAdmin.length > 0) {
      return NextResponse.json(
        { error: "User is already an admin" },
        { status: 400 },
      );
    }

    // Check if email is already used by another admin
    const emailCheck = await db
      .select()
      .from(admins)
      .where(eq(admins.email, adminData.email));

    if (emailCheck.length > 0) {
      return NextResponse.json(
        { error: "Email is already used by another admin" },
        { status: 400 },
      );
    }

    // Insert new admin record
    const newAdmin = await db
      .insert(admins)
      .values({
        id: participantId,
        email: adminData.email,
        fName: adminData.fName,
        lName: adminData.lName,
        role: adminData.role,
        status: adminData.status,
        isAdminOnly: true,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "User promoted to admin successfully",
      admin: newAdmin[0],
    });
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
