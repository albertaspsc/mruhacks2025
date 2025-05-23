import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/";
  const supabase = await createClient();
  const { error } = await supabase.auth.getUser();

  if (!error) {
    supabase.auth.signOut();
  }

  return NextResponse.redirect(`${origin}${next}`);
}
