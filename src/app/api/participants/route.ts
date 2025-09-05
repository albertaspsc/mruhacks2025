import { NextRequest, NextResponse } from "next/server";
import { withApiAuth } from "@/app/auth/api-auth";
import { userRepository } from "@/dal/userRepository";

/**
 * GET /api/participants
 * Returns participant lists depending on the requesting user's role
 */
export const GET = withApiAuth(
  async (request: NextRequest, user: any) => {
    try {
      // Volunteers get limited participant data
      if (user.role === "volunteer") {
        const participants = await userRepository.listBasic(100, 0);
        return NextResponse.json(participants);
      }

      // Admins get full data
      const participants = await userRepository.list(100, 0);
      return NextResponse.json(participants);
    } catch (error) {
      console.error("Error fetching participants:", error);
      return NextResponse.json(
        { error: "Failed to fetch participants" },
        { status: 500 },
      );
    }
  },
  { requiredRoles: ["admin", "volunteer"] },
);
