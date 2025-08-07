import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function DELETE(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Authentication error:", authError);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    console.log("Deleting account for user:", user.id);

    // Call the database function that handles all deletions
    const { error: deleteError } = await supabase.rpc("delete_user_completely");

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete account. Please try again." },
        { status: 500 },
      );
    }

    console.log("Account deleted successfully from all tables");

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("API delete-account error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while deleting your account" },
      { status: 500 },
    );
  }
}
