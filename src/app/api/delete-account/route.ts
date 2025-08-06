import { createClient } from "@/utils/supabase/server";

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
    // With cascade DELETE constraints, deleting the auth user will automatically
    // delete from public.users and public.profiles
    console.log(
      "Deleting Auth user (will cascade to public.users and public.profiles)...",
    );
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(
      user.id,
    );

    if (deleteAuthError) {
      console.error("Auth user deletion failed:", deleteAuthError);
      return Response.json(
        {
          error: "Failed to delete authentication account",
          details: deleteAuthError,
        },
        { status: 500 },
      );
    }

    console.log(
      "Account deletion completed successfully - user deleted from all tables",
    );
    return Response.json({
      success: true,
      message: "Account deleted successfully",
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
