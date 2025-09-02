import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient(true); // Use admin client
    const body = await request.json();

    // Get current user for permission check
    const regularSupabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await regularSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Admin permission check
    const { data: adminData, error: adminError } = await regularSupabase
      .from("admins")
      .select("id, role, status")
      .eq("id", user.id)
      .single();

    if (adminError || !adminData) {
      console.log("User is not an admin:", user.id);
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    if (
      adminData.status !== "active" ||
      !["volunteer", "admin", "super_admin"].includes(adminData.role)
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    // Validate required fields
    const requiredFields = [
      "title",
      "description",
      "date",
      "start_time",
      "end_time",
      "location",
      "max_capacity",
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 },
        );
      }
    }

    // Create workshop
    const { data: workshop, error } = await supabase
      .from("workshops")
      .insert({
        title: body.title,
        description: body.description,
        event_name: body.event_name || "mruhacks2025",
        date: body.date,
        start_time: body.start_time,
        end_time: body.end_time,
        location: body.location,
        max_capacity: parseInt(body.max_capacity),
        is_active: body.is_active !== false,
      })
      .select()
      .single();

    if (error) {
      console.error("Workshop creation error:", error);
      return NextResponse.json(
        { error: "Failed to create workshop" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Workshop created successfully",
      workshop,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
