import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { users, gender, universities, majors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { workshopRepository } from "@/dal/workshopRepository";
import { workshopRegistrationRepository } from "@/dal/workshopRegistrationRepository";
import { DatabaseError, ConflictError } from "@/errors";

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

    // Capacity check using WorkshopRepository
    const registrationCount =
      await workshopRepository.getRegistrationCount(workshopId);
    const maxCapacity: number | null =
      typeof workshop.max_capacity === "number" ? workshop.max_capacity : null;
    const isFull =
      maxCapacity && maxCapacity > 0 ? registrationCount >= maxCapacity : false;
    if (isFull) {
      return NextResponse.json({ error: "Workshop full" }, { status: 409 });
    }

    // Get user details with joins
    const userData = await db
      .select({
        f_name: users.fName,
        l_name: users.lName,
        yearOfStudy: users.yearOfStudy,
        gender: gender.gender,
        major: majors.major,
        university: universities.uni,
      })
      .from(users)
      .leftJoin(gender, eq(users.gender, gender.id))
      .leftJoin(universities, eq(users.university, universities.id))
      .leftJoin(majors, eq(users.major, majors.id))
      .where(eq(users.id, user.id))
      .limit(1);

    if (!userData || userData.length === 0) {
      console.error("User data not found for user:", user.id);
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 },
      );
    }

    const userInfo = userData[0];

    // Insert registration via repository (includes error wrapping)
    try {
      await workshopRegistrationRepository.register(user.id, workshopId);
    } catch (err: any) {
      // If unique constraint -> already registered
      if (
        err.message?.includes("duplicate") ||
        err.message?.includes("Already registered")
      ) {
        return NextResponse.json(
          { error: "Already registered" },
          { status: 409 },
        );
      }

      if (err instanceof DatabaseError) {
        console.error("Registration DB error:", err);
        return NextResponse.json(
          { error: "Registration failed" },
          { status: 500 },
        );
      }

      // unexpected
      console.error("Registration unexpected error:", err);
      return NextResponse.json(
        { error: "Registration failed" },
        { status: 500 },
      );
    }

    // Recompute count to return fresh numbers using WorkshopRepository
    const newCount = await workshopRepository.getRegistrationCount(workshopId);
    const nowFull =
      maxCapacity && maxCapacity > 0 ? newCount >= maxCapacity : false;

    return NextResponse.json({
      isRegistered: true,
      currentRegistrations: newCount,
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

    // Delete registration via repository (RLS should still apply for DB user)
    try {
      const success = await workshopRegistrationRepository.unregister(
        user.id,
        workshopId,
      );
      if (!success) {
        return NextResponse.json(
          { error: "Unregister failed" },
          { status: 400 },
        );
      }
    } catch (err: any) {
      console.error("Unregister DB error:", err);
      return NextResponse.json({ error: "Unregister failed" }, { status: 500 });
    }

    // Recompute counts using WorkshopRepository
    const newCount = await workshopRepository.getRegistrationCount(workshopId);

    // Get workshop details for max capacity using repository
    const workshopDetails = await workshopRepository.getById(workshopId);
    const maxCapacity = workshopDetails?.maxCapacity || null;

    const nowFull =
      maxCapacity && maxCapacity > 0 ? newCount >= maxCapacity : false;

    return NextResponse.json({
      isRegistered: false,
      currentRegistrations: newCount,
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
