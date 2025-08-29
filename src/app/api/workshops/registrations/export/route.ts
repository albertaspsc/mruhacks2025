import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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
  f_name: string;
  l_name: string;
  yearOfStudy: string;
  gender: string;
  major: string;
  workshops: WorkshopData[];
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient(true);
    const { searchParams } = new URL(request.url);
    const workshopId = searchParams.get("workshop");

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

    if (adminData.status !== "active") {
      return NextResponse.json(
        { error: "Admin account is not active" },
        { status: 403 },
      );
    }

    if (!["volunteer", "admin", "super_admin"].includes(adminData.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    let query;

    if (workshopId) {
      query = supabase
        .from("workshops")
        .select(
          `
          id,
          title,
          date,
          start_time,
          end_time,
          location,
          event_name,
          workshop_registrations!inner (
            id,
            registered_at,
            f_name,
            l_name,
            yearOfStudy,
            gender,
            major
          )
        `,
        )
        .eq("id", workshopId)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });
    } else {
      // For all workshops in event queries from workshops
      query = supabase
        .from("workshops")
        .select(
          `
          id,
          title,
          date,
          start_time,
          end_time,
          location,
          event_name,
          workshop_registrations!inner (
            id,
            registered_at,
            f_name,
            l_name,
            yearOfStudy,
            gender,
            major
          )
        `,
        )
        .eq("event_name", "mruhacks2025")
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });
    }

    const { data: workshopsWithRegistrations, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch registrations" },
        { status: 500 },
      );
    }
    const registrations: RegistrationData[] = [];

    workshopsWithRegistrations?.forEach((workshop) => {
      workshop.workshop_registrations?.forEach((registration: any) => {
        registrations.push({
          id: registration.id,
          registered_at: registration.registered_at,
          f_name: registration.f_name,
          l_name: registration.l_name,
          yearOfStudy: registration.yearOfStudy,
          gender: registration.gender,
          major: registration.major,
          workshops: [
            {
              title: workshop.title,
              date: workshop.date,
              start_time: workshop.start_time,
              end_time: workshop.end_time,
              location: workshop.location,
              event_name: workshop.event_name,
            },
          ],
        });
      });
    });

    const typedRegistrations = registrations;

    if (!typedRegistrations || typedRegistrations.length === 0) {
      // Return empty CSV for no registrations
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
      const workshop = reg.workshops[0];

      return [
        workshop?.title || "",
        workshop?.date || "",
        `${workshop?.start_time || ""} - ${workshop?.end_time || ""}`,
        workshop?.location || "",
        `${reg.f_name || ""} ${reg.l_name || ""}`,
        reg.f_name || "",
        reg.l_name || "",
        reg.yearOfStudy || "",
        reg.gender || "",
        reg.major || "",
        new Date(reg.registered_at).toLocaleString(),
      ];
    });

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.map((field) => `"${field}"`).join(",")),
    ].join("\n");

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
