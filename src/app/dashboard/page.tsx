import { use } from "react";
import { createClient } from "../../../utils/supabase/client";
import { unauthorized } from "next/navigation";

export default function Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = use(supabase.auth.getUser());
  if (!user) {
    unauthorized();
  }
  return <p>Some dashboard</p>;
}
