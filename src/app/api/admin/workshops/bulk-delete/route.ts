import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function DELETE(request: NextRequest) {
  try {
    const { workshopIds } = await request.json();

    if (
      !workshopIds ||
      !Array.isArray(workshopIds) ||
      workshopIds.length === 0
    ) {
      return NextResponse.json(
        { error: "workshopIds array is required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Permission check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Admin permission check
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("id, role, status")
      .eq("id", user.id)
      .single();

    if (
      adminError ||
      !adminData ||
      adminData.status !== "active" ||
      !["admin", "super_admin"].includes(adminData.role)
    ) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    // Check if any workshops have registrations
    const { data: workshopsWithRegistrations, error: checkError } =
      await supabase
        .from("workshop_registrations")
        .select("workshop_id")
        .in("workshop_id", workshopIds);

    if (checkError) {
      console.error("Error checking workshop registrations:", checkError);
      return NextResponse.json(
        { error: "Failed to check workshop registrations" },
        { status: 500 },
      );
    }

    const workshopsWithRegistrationsIds = new Set(
      workshopsWithRegistrations?.map((r) => r.workshop_id) || [],
    );

    const workshopsToDelete = workshopIds.filter(
      (id) => !workshopsWithRegistrationsIds.has(id),
    );

    if (workshopsToDelete.length === 0) {
      return NextResponse.json(
        {
          error:
            "All selected workshops have registrations and cannot be deleted",
          workshopsWithRegistrations: Array.from(workshopsWithRegistrationsIds),
        },
        { status: 400 },
      );
    }

    // Delete workshops that don't have registrations
    const { error: deleteError } = await supabase
      .from("workshops")
      .delete()
      .in("id", workshopsToDelete);

    if (deleteError) {
      console.error("Error deleting workshops:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete workshops" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Workshops deleted successfully",
      deletedCount: workshopsToDelete.length,
      deletedWorkshopIds: workshopsToDelete,
      skippedCount: workshopIds.length - workshopsToDelete.length,
      skippedWorkshopIds: Array.from(workshopsWithRegistrationsIds),
    });
  } catch (error) {
    console.error("Unexpected error in bulk delete:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
