import React, { Suspense, use } from "react";
import {} from "@/components/ui/loading-spinner";
import { UserRegistration } from "@/types/registration";
import { getRegistrationDataAction } from "@/actions/registrationActions";
import { createClient } from "@/utils/supabase/server";
import StatusBanner, {
  RegistrationStatus,
} from "@/components/dashboards/shared/ui/StatusBanner";
import WorkshopsCarousel from "@/components/dashboards/user/workshops/WorkshopsCarousel";
import DashboardItem from "@/components/dashboards/shared/ui/DashboardItem";
import Checklist from "@/components/dashboards/user/checklist/Checklist";
import InfoCard from "@/components/dashboards/shared/ui/InfoCard";
import { FileText, MessageSquare, HelpCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Rsvp from "./rsvp";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    redirect("/login");
  }

  const result = await getRegistrationDataAction();
  const user = result.success ? result.data : null;

  if (!user) {
    redirect("/register");
  }

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Main Content */}
      <div className="flex-1 overflow-auto min-w-0 flex flex-col">
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
            {/* Status Banner */}
            {user && (
              <StatusBanner status={user.status as RegistrationStatus} />
            )}

            {/* Discord Card */}

            {/* Dashboard Content */}
            <div className="max-w-full">
              <div className="h-[calc(100vh-4rem)] flex flex-col w-full">
                {/* Grid Layout for Dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto p-1">
                  {/* Left Column - Workshops Carousel and Discord */}
                  <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-2 h-auto">
                    <Rsvp />

                    <DashboardItem
                      title="Upcoming Workshops"
                      className="overflow-hidden"
                      contentClassName="px-0 py-0 overflow-hidden"
                    >
                      <WorkshopsCarousel />
                    </DashboardItem>
                  </div>

                  {/* Right Column - Checklist and Hackerpack */}
                  <div className="lg:col-span-5 xl:col-span-4 h-auto flex flex-col gap-2 overflow-auto pb-1">
                    {/* Compact Checklist */}
                    <div className="flex-shrink-0">
                      <DashboardItem
                        title="Pre-Event Checklist"
                        contentClassName="py-2 px-3 space-y-2"
                      >
                        <Checklist user={user} />
                      </DashboardItem>
                    </div>

                    {/* Hackerpack Card */}
                    <DashboardItem title="Hackerpack">
                      <InfoCard
                        description="The Hackerpack contains all the important information about MRUHacks, including rules, resources, and tips."
                        linkUrl="https://mruhacks.notion.site/"
                        linkText="View Hackerpack"
                        icon={<FileText className="h-5 w-5" />}
                      />
                    </DashboardItem>

                    {/* Support Card */}
                    <DashboardItem title="Need Help?">
                      <InfoCard
                        description="Have a question that isn't included in the FAQ? Send us your question or email us at hello@mruhacks.ca."
                        linkUrl="mailto:hello@mruhacks.ca"
                        linkText="Contact Support"
                        icon={<HelpCircle className="h-5 w-5" />}
                      />
                    </DashboardItem>

                    <DashboardItem title="Join Our Community">
                      <InfoCard
                        description="Connect with fellow hackers, mentors, and organizers in our Discord community. Get real-time updates, ask questions, and find teammates!"
                        linkUrl="https://discord.gg/e7Fg6jsnrm"
                        linkText="Join Discord"
                        icon={<MessageSquare className="h-5 w-5" />}
                      />
                    </DashboardItem>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
