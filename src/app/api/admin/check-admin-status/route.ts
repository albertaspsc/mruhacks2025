import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db/drizzle";
import { admins } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

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

    const body = await request.json();
    const { participantIds } = body;

    if (!Array.isArray(participantIds)) {
      return NextResponse.json(
        { error: "participantIds must be an array" },
        { status: 400 },
      );
    }

    // Get admin status for all participants
    const adminStatuses = await db
      .select({
        id: admins.id,
        role: admins.role,
        status: admins.status,
      })
      .from(admins)
      .where(inArray(admins.id, participantIds));

    // Create a map of participant ID to admin status
    const adminMap = new Map();
    adminStatuses.forEach((admin) => {
      adminMap.set(admin.id, {
        isAdmin: true,
        role: admin.role,
        status: admin.status,
      });
    });

    // Return admin status for all requested participants
    const result = participantIds.map((id: string) => ({
      participantId: id,
      ...(adminMap.get(id) || { isAdmin: false }),
    }));

    return NextResponse.json({
      success: true,
      adminStatuses: result,
    });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
