"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

export async function changeEmail(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // TODO - redirect the user to an error page with some instructions
    //
    // See github issue #70
    redirect("/error");
  }
  const emailSchema = z.string().email().nonempty();
  const getEmail = (index: string) => {
    const value = formData.get(index);
    if (!value) {
      return;
    }
    const { data } = emailSchema.safeParse(value);
    return data;
  };
  const oldEmail = getEmail("old");
  if (oldEmail != user.email) {
  } else {
    // TODO - redirect the user to an error page with some instructions
    //
    // See github issue #70
    redirect("/error");
  }
  const newEmail = getEmail("new");

  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) {
    // TODO - redirect the user to an error page with some instructions
    //
    // See github issue #70
    redirect("/error");
  }

  redirect("/register");
}
