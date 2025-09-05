import { NextRequest, NextResponse } from "next/server";
import { verifyApiAuth } from "@/app/auth/api-auth";
import { userRepository } from "@/dal/userRepository";
import { ValidationError, AuthorizationError, NotFoundError } from "@/errors";

// PATCH - Update participant status and/or checkedIn status
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  // Verify authentication first
  const authResult = await verifyApiAuth(request);

  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const user = authResult.user!;

  // Check if user has required role
  if (!["admin", "volunteer"].includes(user.role)) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 },
    );
  }
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status, checkedIn } = body;

    // Use repository to perform update with role-based validation
    try {
      const updated = await userRepository.update(id, {
        ...(status !== undefined ? { status } : {}),
        ...(checkedIn !== undefined ? { checkedIn } : {}),
      } as any);

      if (!updated) {
        return NextResponse.json(
          { error: "Participant not found" },
          { status: 404 },
        );
      }

      const response =
        user.role === "volunteer"
          ? {
              id: updated.id,
              f_name: updated.fName,
              l_name: updated.lName,
              status: (updated as any).status,
              checked_in: (updated as any).checkedIn || false,
            }
          : {
              id: updated.id,
              f_name: updated.fName,
              l_name: updated.lName,
              email: updated.email,
              status: (updated as any).status,
              checked_in: (updated as any).checkedIn || false,
              timestamp: updated.timestamp,
            };

      return NextResponse.json(response, { status: 200 });
    } catch (err: any) {
      if (err instanceof ValidationError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }

    // (Handled above) response already returned after successful update
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update participant" },
      { status: 500 },
    );
  }
}

// GET - Get single participant
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  // Verify authentication first
  const authResult = await verifyApiAuth(request);

  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const user = authResult.user!;
  if (!["admin", "volunteer"].includes(user.role)) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 },
    );
  }

  try {
    const { id } = await context.params;
    const participant =
      user.role === "volunteer"
        ? await userRepository.getBasicById(id)
        : await userRepository.getById(id);

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(participant, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch participant" },
      { status: 500 },
    );
  }
}
