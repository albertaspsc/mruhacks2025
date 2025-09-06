import { NextRequest, NextResponse } from "next/server";
import {
  getWorkshopsForUser,
  createWorkshop,
} from "@/services/WorkshopService";

/**
 * GET /api/workshops
 * Get all active workshops for the current event
 * Includes registration status if user is authenticated
 */
export async function GET(request: NextRequest) {
  try {
    const workshops = await getWorkshopsForUser(request);
    return NextResponse.json(workshops);
  } catch (error: any) {
    console.error("Workshops fetch error:", error);

    // Handle known error types
    if (error.statusCode) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/workshops
 * Create a new workshop (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const workshop = await createWorkshop(request, body);
    return NextResponse.json(workshop, { status: 201 });
  } catch (error: any) {
    console.error("Workshop creation error:", error);

    if (error.statusCode) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
