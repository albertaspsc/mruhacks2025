import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText } from "lucide-react";

// User interface
interface User {
  id: string;
  name: string;
  email: string;
  status: "confirmed" | "pending" | "waitlisted";
}

interface ParticipantDashboardProps {
  user?: User;
}

const ParticipantDashboard: React.FC<ParticipantDashboardProps> = ({
  user,
}) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">
        MRUHacks Dashboard
      </h1>

      {/* Main Card */}
      <Card className="mb-8">
        <CardHeader className="bg-purple-100 dark:bg-purple-900/20 rounded-t-lg text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <FileText className="h-6 w-6" />
            Hackerpack
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 text-center">
          <p className="mb-4">
            The Hackerpack contains all the important information about
            MRUHacks, including rules, resources, and tips for a successful
            hackathon experience.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            className="w-full md:w-auto px-8"
            onClick={(): void => {
              window.open(
                "https://mruhacks.notion.site/Hackerpack-426b5b28cc0a4b069deb0f64f26af37a",
                "_blank",
              );
            }}
          >
            <ExternalLink className="mr-2 h-5 w-5" /> View Hackerpack
          </Button>
        </CardFooter>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Upcoming Activities</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg">
            Event schedules and workshop information will be posted here closer
            to the event.
          </p>
          <p className="mt-4 text-lg">Check back soon for updates!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParticipantDashboard;
