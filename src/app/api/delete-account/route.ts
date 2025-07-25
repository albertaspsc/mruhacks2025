import { createClient } from "@/utils/supabase/server";
import { deleteUserProfile } from "@/db/settings";

export async function DELETE() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Delete from database
  const { error: dbError } = await deleteUserProfile(supabase);
  if (dbError) {
    return Response.json(
      { error: "Database deletion failed" },
      { status: 500 },
    );
  }

  // Delete from Supabase Auth (requires service role)
  const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
  if (authError) {
    return Response.json({ error: "Auth deletion failed" }, { status: 500 });
  }

  return Response.json({ success: true });
}
