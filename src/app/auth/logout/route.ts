import { createClient } from "../../../../utils/supabase/server";
import { redirect } from "next/navigation";

export async function GET() {
  const supabase = await createClient();
  const { error } = await supabase.auth.getUser();

  if (!error) {
    supabase.auth.signOut();
  }

  redirect("/");
}
