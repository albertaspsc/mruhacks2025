"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../../utils/supabase/server";
import { db } from "../../db/drizzle";
import { users } from "../../db/schema";

export async function register(formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    redirect("/login");
  }

  const record = {
    id: data.user.id,
    firstName: formData.get("f_name"),
    lastName: formData.get("l_name"),
    dob: formData.get("dob"),
    gender: formData.get("gender"),
    school: formData.get("school"),
    yearOfStudy: formData.get("year_of_study"),
    experience: formData.get("experience"),
  };

  await db.insert(users).values(record);

  redirect("/dashboard");
}
