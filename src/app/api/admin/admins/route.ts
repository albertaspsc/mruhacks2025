import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db/drizzle";
import { adminManagementView } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
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
      .from(adminManagementView)
      .where(eq(adminManagementView.id, user.id));

    if (adminCheck.length === 0) {
      return NextResponse.json(
        { error: "Admin privileges required" },
        { status: 403 },
      );
    }

    // Fetch all admin users from the admin management view
    const adminUsers = await db
      .select()
      .from(adminManagementView)
      .orderBy(adminManagementView.createdAt);

    return NextResponse.json({
      success: true,
      admins: adminUsers,
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin users" },
      { status: 500 },
    );
  }
}
