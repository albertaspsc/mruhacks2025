import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 },
      );
    }

    const { data: workshops, error: workshopsError } = await supabase
      .from("workshops")
      .select("*")
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (workshopsError) {
      console.error("Database error:", workshopsError);
      return NextResponse.json(
        { error: "Failed to fetch workshops" },
        { status: 500 },
      );
    }

    // If no workshops exist, return empty array
    if (!workshops || workshops.length === 0) {
      console.log("No workshops found");
      return NextResponse.json([]);
    }

    // Get registration counts for each workshop
    const workshopIds = workshops.map((w) => w.id);
    const { data: registrations, error: regError } = await supabase
      .from("workshop_registrations")
      .select("workshop_id, user_id")
      .in("workshop_id", workshopIds);

    if (regError) {
      console.error("Registration count error:", regError);
      // Return workshops without counts if registration query fails
      return NextResponse.json(
        workshops.map((w) => ({
          ...w,
          currentRegistrations: 0,
          isRegistered: false,
          isFull: false,
        })),
      );
    }

    // Count registrations per workshop
    const registrationCounts: Record<string, number> = {};
    const userRegistrations: string[] = [];

    registrations?.forEach((reg) => {
      registrationCounts[reg.workshop_id] =
        (registrationCounts[reg.workshop_id] || 0) + 1;
      if (user && reg.user_id === user.id) {
        userRegistrations.push(reg.workshop_id);
      }
    });

    const transformedWorkshops = workshops.map((workshop: any) => ({
      id: workshop.id,
      title: workshop.title,
      description: workshop.description,
      date: new Date(workshop.date),
      startTime: workshop.start_time,
      endTime: workshop.end_time,
      location: workshop.location,
      maxCapacity: workshop.max_capacity,
      currentRegistrations: registrationCounts[workshop.id] || 0,
      isRegistered: userRegistrations.includes(workshop.id),
      isFull:
        workshop.max_capacity > 0
          ? (registrationCounts[workshop.id] || 0) >= workshop.max_capacity
          : false,
    }));

    return NextResponse.json(transformedWorkshops);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
