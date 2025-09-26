"use client";
import { use, useState } from "react";
import { BindInput } from "@/components/forms/BindInput";
import { changeEmail } from "./actions";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ChangeEmail() {
  const supabase = createClient();
  const {
    data: { user },
  } = use(supabase.auth.getUser());
  if (!user) {
    // TODO - redirect the user to an error page with some instructions
    //
    // See github issue #70
    redirect("/error");
  }
  const [oldEmail, setOldEmail] = useState<string>();
  const [newEmail, setNewEmail] = useState<string>();
  return (
    <>
      <form>
        <h1>Change Email</h1>
        <label htmlFor="oldEmail">Confirm old email</label>
        <BindInput
          type="email"
          name="old"
          id="oldEmail"
          getState={oldEmail}
          setState={setOldEmail}
        />
        <label htmlFor="newEmail">New email</label>
        <BindInput
          type="email"
          name="new"
          id="newEmail"
          getState={newEmail}
          setState={setNewEmail}
        />
        <button type="submit" formAction={changeEmail}>
          Update Email
        </button>
      </form>
    </>
  );
}
