import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Can export both individual workshop and all workshop regsitration info

// Define types for the registration data
interface WorkshopData {
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  event_name: string;
}

interface RegistrationData {
  id: string;
  registered_at: string;
  first_name: string;
  last_name: string;
  year_of_study: string;
  gender: string;
  major: string;
  workshops: WorkshopData[];
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient(true);
    const { searchParams } = new URL(request.url);
    const workshopId = searchParams.get("workshop"); // Check for specific workshop ID

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

    // Check if user has required role (volunteer, admin, super_admin)
    if (!["volunteer", "admin", "super_admin"].includes(adminData.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    // Build query - filter by specific workshop or all workshops for event
    let query = supabase.from("workshop_registrations").select(`
        id,
        registered_at,
        first_name,
        last_name,
        year_of_study,
        gender,
        major,
        workshops!inner (
          title,
          date,
          start_time,
          end_time,
          location,
          event_name
        )
      `);

    // Apply filters based on request
    if (workshopId) {
      query = query.eq("workshop_id", workshopId);
    } else {
      query = query.eq("workshops.event_name", "mruhacks2025");
    }

    const { data: registrations, error } = await query
      .order("workshops.date", { ascending: true })
      .order("workshops.start_time", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch registrations" },
        { status: 500 },
      );
    }

    const typedRegistrations = registrations as unknown as RegistrationData[];

    if (!typedRegistrations || typedRegistrations.length === 0) {
      // Return empty CSV instead of 404 for no registrations
      const csvHeaders = [
        "Workshop Title",
        "Date",
        "Time",
        "Location",
        "Participant Name",
        "First Name",
        "Last Name",
        "Year of Study",
        "Gender",
        "Major",
        "Registration Date",
      ];

      const csvContent = csvHeaders.join(",");
      const filename = workshopId
        ? `workshop-${workshopId}-registrations.csv`
        : "workshop-registrations-mruhacks2025.csv";

      return new Response(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // Create CSV content
    const csvHeaders = [
      "Workshop Title",
      "Date",
      "Time",
      "Location",
      "Participant Name",
      "First Name",
      "Last Name",
      "Year of Study",
      "Gender",
      "Major",
      "Registration Date",
    ];

    const csvRows = typedRegistrations.map((reg) => {
      // Get the first workshop (should only be one due to the inner join)
      const workshop = reg.workshops[0];

      return [
        workshop?.title || "",
        workshop?.date || "",
        `${workshop?.start_time || ""} - ${workshop?.end_time || ""}`,
        workshop?.location || "",
        `${reg.first_name || ""} ${reg.last_name || ""}`,
        reg.first_name || "",
        reg.last_name || "",
        reg.year_of_study || "",
        reg.gender || "",
        reg.major || "",
        new Date(reg.registered_at).toLocaleString(),
      ];
    });

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.map((field) => `"${field}"`).join(",")),
    ].join("\n");

    // Dynamic filename based on request type
    const filename = workshopId
      ? `workshop-${workshopId}-registrations.csv`
      : "workshop-registrations-mruhacks2025.csv";

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
