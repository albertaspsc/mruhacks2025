import React from "react";
import { Registration } from "@/db/registration";
import WorkshopsCarousel from "@/components/dashboards/WorkshopsCarousel";
import DashboardItem from "./DashboardItem";
import Checklist from "./checklist/Checklist";
import InfoCard from "./InfoCard";
import { FileText, MessageSquare, HelpCircle } from "lucide-react";

interface ParticipantDashboardProps {
  user?: Registration;
}

const ParticipantDashboard: React.FC<ParticipantDashboardProps> = ({
  user,
}) => {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col w-full">
      {/* Grid Layout for Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto p-1">
        {/* Left Column - Workshops Carousel and Discord */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-2 h-auto">
          <DashboardItem
            title="Upcoming Workshops"
            className="overflow-hidden"
            contentClassName="px-0 py-0 overflow-hidden"
          >
            <WorkshopsCarousel />
          </DashboardItem>

          {/* Discord Card */}
          <DashboardItem title="Join Our Community">
            <InfoCard
              description="Connect with fellow hackers, mentors, and organizers in our Discord community. Get real-time updates, ask questions, and find teammates!"
              linkUrl="https://discord.gg/e7Fg6jsnrm"
              linkText="Join Discord"
              icon={<MessageSquare className="h-5 w-5" />}
            />
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
              linkUrl="/hackerpack"
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
        </div>
      </div>
    </div>
  );
};

export default ParticipantDashboard;
