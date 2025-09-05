import { NextRequest, NextResponse } from "next/server";
import { WorkshopService } from "@/services/WorkshopService";
import { workshopRegistrationRepository } from "@/dal/workshopRegistrationRepository";

// Add lightweight logging/metrics for this route
const routeLog = (msg: string, meta?: any) =>
  console.debug(`[Workshops/Registrations] ${msg}`, meta || "");

/**
 * GET /api/workshops/registrations?id={workshopId}
 * Get workshop registrations with participant details (admin/volunteer only)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workshopId = searchParams.get("id");

    if (!workshopId) {
      return NextResponse.json(
        { error: "Workshop ID is required" },
        { status: 400 },
      );
    }

    routeLog("Fetching registrations", { workshopId });
    const response = await WorkshopService.getWorkshopRegistrations(
      request,
      workshopId,
    );
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Workshop registrations fetch error:", error);

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
