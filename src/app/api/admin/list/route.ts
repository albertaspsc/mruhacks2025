import { NextResponse } from "next/server";
import { listAdminOnlyAccounts } from "src/db/admin";

export async function GET() {
  try {
    const result = await listAdminOnlyAccounts();

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("List admin accounts error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
