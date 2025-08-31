import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Helper to compute current registration count efficiently
async function getRegistrationCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workshopId: string,
) {
  const { count, error } = await supabase
    .from("workshop_registrations")
    .select("user_id", { count: "exact", head: true })
    .eq("workshop_id", workshopId);

  if (error) {
    return { error } as const;
  }
  return { count: count ?? 0 } as const;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id: workshopId } = await params;

    // Auth required
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

    // Fetch workshop details
    const { data: workshop, error: workshopError } = await supabase
      .from("workshops")
      .select("id, is_active, max_capacity")
      .eq("id", workshopId)
      .single();

    if (workshopError || !workshop) {
      return NextResponse.json(
        { error: "Workshop not found" },
        { status: 404 },
      );
    }

    if (workshop.is_active === false) {
      return NextResponse.json(
        { error: "Workshop is not active" },
        { status: 409 },
      );
    }

    // Already registered?
    const { data: existing, error: existingError } = await supabase
      .from("workshop_registrations")
      .select("id")
      .eq("workshop_id", workshopId)
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (existingError) {
      // Fall through to attempt insert; RLS/constraint will protect
      // but still try to provide a better error below
    }

    if (existing) {
      return NextResponse.json(
        { error: "Already registered" },
        { status: 409 },
      );
    }

    // Capacity check
    const { count, error: countError } = await getRegistrationCount(
      supabase,
      workshopId,
    );
    if (countError) {
      return NextResponse.json(
        { error: "Failed to check capacity" },
        { status: 500 },
      );
    }

    const maxCapacity: number | null =
      typeof workshop.max_capacity === "number" ? workshop.max_capacity : null;
    const isFull =
      maxCapacity && maxCapacity > 0 ? (count ?? 0) >= maxCapacity : false;
    if (isFull) {
      return NextResponse.json({ error: "Workshop full" }, { status: 409 });
    }

    // Insert registration
    const { error: insertError } = await supabase
      .from("workshop_registrations")
      .insert({
        workshop_id: workshopId,
        user_id: user.id,
        registered_at: new Date().toISOString(),
      });

    if (insertError) {
      // Unique violation -> already registered
      const message =
        (insertError as any)?.code === "23505"
          ? "Already registered"
          : "Registration failed";
      return NextResponse.json({ error: message }, { status: 409 });
    }

    // Recompute count to return fresh numbers
    const { count: newCount, error: recountError } = await getRegistrationCount(
      supabase,
      workshopId,
    );
    if (recountError) {
      return NextResponse.json(
        { error: "Registration succeeded but failed to fetch count" },
        { status: 200 },
      );
    }

    const nowFull =
      maxCapacity && maxCapacity > 0 ? (newCount ?? 0) >= maxCapacity : false;

    return NextResponse.json({
      isRegistered: true,
      currentRegistrations: newCount ?? 0,
      isFull: nowFull,
    });
  } catch (error) {
    console.error("Workshop register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id: workshopId } = await params;

    // Auth required
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

    // Delete registration (RLS should ensure only own row is deletable)
    const { error: deleteError } = await supabase
      .from("workshop_registrations")
      .delete()
      .eq("workshop_id", workshopId)
      .eq("user_id", user.id);

    if (deleteError) {
      return NextResponse.json({ error: "Unregister failed" }, { status: 400 });
    }

    // Recompute counts
    const { count: newCount, error: recountError } = await getRegistrationCount(
      supabase,
      workshopId,
    );
    if (recountError) {
      return NextResponse.json(
        { error: "Unregistered but failed to fetch count" },
        { status: 200 },
      );
    }

    // We need max capacity to compute isFull; if not available just compute false
    let maxCapacity: number | null = null;
    const { data: workshop } = await supabase
      .from("workshops")
      .select("max_capacity")
      .eq("id", workshopId)
      .single();
    if (workshop && typeof workshop.max_capacity === "number") {
      maxCapacity = workshop.max_capacity;
    }

    const nowFull =
      maxCapacity && maxCapacity > 0 ? (newCount ?? 0) >= maxCapacity : false;

    return NextResponse.json({
      isRegistered: false,
      currentRegistrations: newCount ?? 0,
      isFull: nowFull,
    });
  } catch (error) {
    console.error("Workshop unregister error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
