import { createClient } from "@/utils/supabase/server";
import { deleteUserProfile } from "@/db/settings";

export async function DELETE() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("Auth error:", error);
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("Starting account deletion for user:", user.id);

  try {
    // Delete all user data from database tables
    console.log("Deleting user data from database...");
    const { error: dbError } = await deleteUserProfile(supabase);

    if (dbError) {
      console.error("Database deletion failed:", dbError);
      return Response.json(
        {
          error: "Failed to delete account data",
          details: dbError,
        },
        { status: 500 },
      );
    }

    console.log("Database deletion successful");

    // Sign out the user - they won't be able to log in anymore since their profile is gone0
    console.log("Signing out user...");
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.warn("⚠️ Sign out failed (non-critical):", signOutError);
    }

    console.log("Account deletion completed successfully");
    return Response.json({
      success: true,
      message: "Account data deleted successfully",
    });
  } catch (error) {
    console.error("Unexpected error during deletion:", error);
    return Response.json(
      {
        error: "Internal server error during account deletion",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
