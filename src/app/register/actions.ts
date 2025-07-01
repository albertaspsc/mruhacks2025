"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../../utils/supabase/server";
import { db } from "../../db/drizzle";
import { users } from "../../db/schema";
import { createInsertSchema } from "drizzle-zod";

const userSchema = createInsertSchema(users);

export async function register(formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  // TODO - redirect the user to an error page with some instructions
  //
  // See github issue #70
  if (error) {
    redirect("/login");
  }

  const record = {
    id: data.user.id,
    firstName: formData.get("f_name"),
    lastName: formData.get("l_name"),
    schoolEmail: formData.get("school_email"),
    dob: formData.get("dob"),
    gender: formData.get("gender"),
    school: formData.get("school"),
    yearOfStudy: formData.get("year_of_study"),
    experience: formData.get("experience"),
  };

  const { data: user, error: userError } = userSchema.safeParse(record);

  // TODO - redirect the user to an error page with some instructions
  //
  // See github issue #70
  if (userError) {
    redirect("/error");
  }

  await db.insert(users).values(user);

  redirect("/dashboard");
}
