import { use } from "react";
import { createClient } from "../../../utils/supabase/client";
import { redirect, unauthorized } from "next/navigation";

export default function Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = use(supabase.auth.getUser());
  if (!user) {
    redirect("/error");
  }
  return <p>Some dashboard</p>;
}
