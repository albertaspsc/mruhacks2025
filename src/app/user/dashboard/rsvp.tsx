"use server";

import DashboardItem from "@/components/dashboards/common/DashboardItem";
import { Button } from "@/components/ui/button";
import { db } from "@/db/drizzle";
import { createClient } from "@/utils/supabase/server";
import RSVPButton from "./confirm_button";

async function confirm() {
  "use server";
  // await client.from("rsvp").upsert({ id: userData.user!.id });
}

async function deny() {
  "use server";
  const client = await createClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  await client
    .from("users")
    .update({ status: "declined" })
    .eq("id", userData.user!.id);
}

export default async function Rsvp() {
  const client = await createClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (!userData || userError) throw new Error("Cannot load user");

  const { data } = await client
    .from("rsvpable_users")
    .select()
    .eq("id", userData.user.id)
    .maybeSingle();

  const userCanRSVP = !!data;

  if (!userCanRSVP) return null;

  return (
    <DashboardItem
      title="RSVP Now!"
      className="overflow-hidden"
      contentClassName="py-2 px-3 space-y-2 flex flex-col"
    >
      Congratulations you have a spot waiting for you, save your spot now.
      <div className="flex flex-row lg:w-1/2 mt-2 space-x-2">
        <RSVPButton />
        <Button>Decline</Button>
      </div>
    </DashboardItem>
  );
}
