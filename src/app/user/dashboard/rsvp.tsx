"use server";

import DashboardItem from "@/components/dashboards/common/DashboardItem";
import { createClient } from "@/utils/supabase/server";
import RSVPButton, { ConfirmDecline } from "./confirm_button";
import { RegistrationStatus } from "@/components/dashboards/common/StatusBanner";

export default async function Rsvp() {
  const client = await createClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (!userData || userError) throw new Error("Cannot load user");

  const [rsvpRes, statusRes] = await Promise.all([
    client
      .from("rsvpable_users")
      .select()
      .eq("id", userData.user.id)
      .maybeSingle(),
    client
      .from("users")
      .select("status")
      .eq("id", userData.user.id)
      .maybeSingle(),
  ]);

  const userCanRSVP = !!rsvpRes.data;
  const status = statusRes.data?.status as RegistrationStatus;

  const messages: Partial<Record<RegistrationStatus, string>> = {
    confirmed: "You’ve confirmed your spot. See you at the event!",
    pending: "Your registration is pending. Please RSVP to secure your spot.",
    waitlisted:
      "We don't have a spot for you at this time. We'll email you if a slot opens up.",
  };

  if (status == "denied" || status == "declined" || !userCanRSVP) return null;

  return (
    <DashboardItem
      title="Registration Status"
      className="overflow-hidden"
      contentClassName="py-2 px-3 space-y-2 flex flex-col"
    >
      {messages[status]}
      <div className="flex flex-row lg:w-1/2 mt-2 space-x-2">
        <RSVPButton disabled={!userCanRSVP} />
        <ConfirmDecline />
      </div>
    </DashboardItem>
  );
}
