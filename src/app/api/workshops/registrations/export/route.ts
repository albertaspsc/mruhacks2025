import { Registration } from "@/db/registration";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient(true);
    const { searchParams } = new URL(request.url);
    const workshopId = searchParams.get("workshop");

    console.log("Export request for workshop ID:", workshopId);

    // Get current user for permission check
    const regularSupabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await regularSupabase.auth.getUser();

    if (authError || !user) {
      console.log("Authentication error:", authError);
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
      console.log("User is not an admin:", user.id, adminError);
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    if (adminData.status !== "active") {
      console.log("Admin account is not active:", adminData);
      return NextResponse.json(
        { error: "Admin account is not active" },
        { status: 403 },
      );
    }

    if (!["volunteer", "admin"].includes(adminData.role)) {
      console.log("Insufficient permissions:", adminData.role);
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    if (workshopId) {
      // First get the workshop details
      const { data: workshop, error: workshopError } = await supabase
        .from("workshops")
        .select("id, title, date, start_time, end_time, location, event_name")
        .eq("id", workshopId)
        .single();

      if (workshopError || !workshop) {
        console.log("Workshop not found:", workshopId, workshopError);
        return NextResponse.json(
          { error: "Workshop not found" },
          { status: 404 },
        );
      }

      console.log("Workshop found:", workshop.title);

      // Then get the registrations separately
      const { data: registrations, error: registrationsError } = await supabase
        .from("workshop_registrations")
        .select(
          `
          id,
          registered_at,
          f_name,
          l_name,
          yearOfStudy,
          gender,
          major
        `,
        )
        .eq("workshop_id", workshopId)
        .order("registered_at", { ascending: true });

      if (registrationsError) {
        console.error("Database error:", registrationsError);
        return NextResponse.json(
          { error: "Failed to fetch registrations" },
          { status: 500 },
        );
      }

      console.log("Registrations retrieved:", registrations?.length || 0);

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

      let csvContent;
      const filename = `${workshop.title.replace(/[^a-zA-Z0-9]/g, "_")}_registrations.csv`;

      if (!registrations || registrations.length === 0) {
        // Return CSV with headers only for no registrations
        csvContent = csvHeaders.join(",");
        console.log("No registrations found, returning empty CSV");
      } else {
        const csvRows = registrations.map((reg) => {
          return [
            `"${workshop.title || ""}"`,
            `"${workshop.date || ""}"`,
            `"${workshop.start_time || ""} - ${workshop.end_time || ""}"`,
            `"${workshop.location || ""}"`,
            `"${reg.f_name || ""} ${reg.l_name || ""}"`,
            `"${reg.f_name || ""}"`,
            `"${reg.l_name || ""}"`,
            `"${reg.yearOfStudy || ""}"`,
            `"${reg.gender || ""}"`,
            `"${reg.major || ""}"`,
            `"${new Date(reg.registered_at).toLocaleString()}"`,
          ];
        });

        csvContent = [
          csvHeaders.join(","),
          ...csvRows.map((row) => row.join(",")),
        ].join("\n");

        console.log(
          "Generated CSV with",
          registrations.length,
          "registrations",
        );
      }

      return new Response(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } else {
      // Handle sthe case where no workshop ID is provided (export all)
      // get all workshops
      const { data: workshops, error: workshopsError } = await supabase
        .from("workshops")
        .select("id, title, date, start_time, end_time, location, event_name")
        .eq("event_name", "mruhacks2025")
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });

      if (workshopsError) {
        console.error("Database error:", workshopsError);
        return NextResponse.json(
          { error: "Failed to fetch workshops" },
          { status: 500 },
        );
      }

      // Get all registrations for these workshops
      const workshopIds = workshops?.map((w) => w.id) || [];

      let allRegistrations: any[] = [];
      if (workshopIds.length > 0) {
        const { data: registrations, error: registrationsError } =
          await supabase
            .from("workshop_registrations")
            .select(
              `
            id,
            workshop_id,
            registered_at,
            f_name,
            l_name,
            yearOfStudy,
            gender,
            major
          `,
            )
            .in("workshop_id", workshopIds)
            .order("registered_at", { ascending: true });

        if (registrationsError) {
          console.error("Database error:", registrationsError);
          return NextResponse.json(
            { error: "Failed to fetch registrations" },
            { status: 500 },
          );
        }

        allRegistrations = (registrations || []) as Registration[];
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

      const csvRows = allRegistrations.map((reg) => {
        const workshop = workshops?.find((w) => w.id === reg.workshop_id);
        return [
          `"${workshop?.title || ""}"`,
          `"${workshop?.date || ""}"`,
          `"${workshop?.start_time || ""} - ${workshop?.end_time || ""}"`,
          `"${workshop?.location || ""}"`,
          `"${reg.f_name || ""} ${reg.l_name || ""}"`,
          `"${reg.f_name || ""}"`,
          `"${reg.l_name || ""}"`,
          `"${reg.yearOfStudy || ""}"`,
          `"${reg.gender || ""}"`,
          `"${reg.major || ""}"`,
          `"${new Date(reg.registered_at).toLocaleString()}"`,
        ];
      });

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) => row.join(",")),
      ].join("\n");

      const filename = "workshop-registrations-mruhacks2025.csv";

      return new Response(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
