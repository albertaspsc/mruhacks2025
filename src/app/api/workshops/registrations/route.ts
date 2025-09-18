import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{}> },
) {
  const { params } = context;
  try {
    const supabase = await createClient(true);
    // Try to get workshop id from query string first (e.g. /api/workshops/registrations?workshop=ID)
    const url = new URL(request.url);
    let workshopId = url.searchParams.get("workshop") ?? null;

    // Fallback: if invoked via a dynamic route, read id from params
    if (!workshopId) {
      const maybeParams = (await params) as Record<string, string> | undefined;
      workshopId = maybeParams?.id ?? null;
    }

    if (!workshopId) {
      return NextResponse.json(
        { error: "Missing workshop id" },
        { status: 400 },
      );
    }

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

    // Check if admin account is active and has proper role
    if (adminData.status !== "active") {
      return NextResponse.json(
        { error: "Admin account is not active" },
        { status: 403 },
      );
    }

    // Check if user has required role (volunteer, admin)
    if (!["volunteer", "admin"].includes(adminData.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    // Get workshop details and registrations
    const { data: workshop, error: workshopError } = await supabase
      .from("workshops")
      .select("id, title, max_capacity")
      .eq("id", workshopId)
      .single();

    if (workshopError || !workshop) {
      return NextResponse.json(
        { error: "Workshop not found" },
        { status: 404 },
      );
    }

    // Get all registrations for this workshop with correct column names
    const { data: registrations, error: registrationsError } = await supabase
      .from("workshop_registrations")
      .select(
        `
        id,
        registered_at,
        f_name,
        l_name,
        "yearOfStudy",
        gender,
        major,
        user_id
      `,
      )
      .eq("workshop_id", workshopId)
      .order("registered_at", { ascending: true });

    if (registrationsError) {
      console.error("Registrations fetch error:", registrationsError);
      return NextResponse.json(
        { error: "Failed to fetch registrations" },
        { status: 500 },
      );
    }

    // Format the response
    const response = {
      workshop: {
        id: workshop.id,
        title: workshop.title,
        maxCapacity: workshop.max_capacity,
        currentRegistrations: registrations?.length || 0,
      },
      registrations: (registrations || []).map((reg) => ({
        id: reg.id,
        registeredAt: reg.registered_at,
        participant: {
          firstName: reg.f_name,
          lastName: reg.l_name,
          fullName: `${reg.f_name} ${reg.l_name}`,
          yearOfStudy: reg.yearOfStudy,
          gender: reg.gender,
          major: reg.major,
        },
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Registrations fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
