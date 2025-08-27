import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createClient();
    const workshopId = params.id;

    const { data: workshop, error } = await supabase
      .from("workshops")
      .select("*")
      .eq("id", workshopId)
      .single();

    if (error || !workshop) {
      return NextResponse.json(
        { error: "Workshop not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(workshop);
  } catch (error) {
    console.error("Error fetching workshop:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createClient(true);
    const body = await request.json();
    const workshopId = params.id;

    // Permission check
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

    if (
      adminError ||
      !adminData ||
      adminData.status !== "active" ||
      !["volunteer", "admin", "super_admin"].includes(adminData.role)
    ) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    // Update workshop
    const { data: workshop, error } = await supabase
      .from("workshops")
      .update({
        title: body.title,
        description: body.description,
        date: body.date,
        start_time: body.start_time,
        end_time: body.end_time,
        location: body.location,
        max_capacity: parseInt(body.max_capacity),
        is_active: body.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", workshopId)
      .select()
      .single();

    if (error) {
      console.error("Workshop update error:", error);
      return NextResponse.json(
        { error: "Failed to update workshop" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Workshop updated successfully",
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createClient(true);
    const workshopId = params.id;

    // Permission check
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

    if (
      adminError ||
      !adminData ||
      adminData.status !== "active" ||
      !["volunteer", "admin", "super_admin"].includes(adminData.role)
    ) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    // Check if workshop has registrations
    const { count } = await supabase
      .from("workshop_registrations")
      .select("*", { count: "exact", head: true })
      .eq("workshop_id", workshopId);

    if (count && count > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete workshop with existing registrations. Please cancel registrations first.",
        },
        { status: 400 },
      );
    }

    // Delete workshop
    const { error } = await supabase
      .from("workshops")
      .delete()
      .eq("id", workshopId);

    if (error) {
      console.error("Workshop deletion error:", error);
      return NextResponse.json(
        { error: "Failed to delete workshop" },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Workshop deleted successfully" });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
