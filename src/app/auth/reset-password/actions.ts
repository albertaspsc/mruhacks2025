"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../../../utils/supabase/server";

export async function changePassword(formData: FormData) {
  const supabase = await createClient();

  const password = formData.get("password");
  const confirmPassw = formData.get("confirm");

  if (!password) {
    // TODO - redirect the user to an error page with some instructions
    //
    // See github issue #70
    redirect("/error?cause=no password provided");
  }

  if (password != confirmPassw) {
    // TODO - redirect the user to an error page with some instructions
    //
    // See github issue #70
    redirect("/error?cause=password mismatch");
  }

  const { error } = await supabase.auth.updateUser({
    password: password as string,
  });

  if (error) {
    // TODO - redirect the user to an error page with some instructions
    //
    // See github issue #70
    redirect(`/error?cause=${error.cause ?? "unable to update user"}`);
  }

  redirect("/");
}
