import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProgressBar from "@/components/Register/ProgressBar";
import { ExternalLink, FileText, MessageSquare, Trophy } from "lucide-react";
import { Registration } from "src/db/registration";

interface ParticipantDashboardProps {
  user?: Registration;
}

const Checklist = ({ user }: { user?: Registration }) => {
  const [checklist, setChecklist] = useState({
    discordJoined: false,
    devpostSignup: false,
  });

  const handleChecklistChange = (item: string) => {
    setChecklist((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const checklistItems = [
    {
      id: "discordJoined",
      title: "Join our Discord server",
      description: "Connect with other participants and get real-time updates",
      icon: <MessageSquare className="w-5 h-5" />,
      link: "https://discord.com/invite/e7Fg6jsnrm",
      linkText: "Join Discord",
      required: true,
      note: null,
    },
    {
      id: "devpostSignup",
      title: "Sign up through DevPost",
      description: "Required for project submission and judging",
      icon: <Trophy className="w-5 h-5" />,
      link: "https://devpost.com/mruhacks", // Replace with DevPost link
      linkText: "Go to DevPost",
      required: false,
      note:
        user?.status === "confirmed"
          ? "Your registration is confirmed - you can now register on DevPost!"
          : "Only register on DevPost if your registration has been accepted",
    },
  ];

  const completedItems = Object.values(checklist).filter(Boolean).length;
  const totalItems = checklistItems.length;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl">Pre-Event Checklist</CardTitle>
        <CardDescription>
          Complete these steps to prepare for MRUHacks
        </CardDescription>

        {/* Progress Section */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {completedItems} of {totalItems} completed
            </span>
            <span>
              {totalItems > 0
                ? Math.round((completedItems / totalItems) * 100)
                : 0}
              %
            </span>
          </div>
          <ProgressBar step={completedItems} totalSteps={totalItems} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Checklist Items */}
        <div className="space-y-3">
          {checklistItems.map((item) => (
            <Card
              key={item.id}
              className={`transition-all duration-200 ${
                checklist[item.id]
                  ? "bg-green-50 border-green-200"
                  : "hover:shadow-sm"
              }`}
            >
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <div className="flex items-center space-x-2 pt-1">
                    <Checkbox
                      id={item.id}
                      checked={checklist[item.id]}
                      onCheckedChange={() => handleChecklistChange(item.id)}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <h4
                        className={`font-medium text-sm ${checklist[item.id] ? "text-green-800" : "text-foreground"}`}
                      >
                        {item.title}
                        {item.required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </h4>
                    </div>

                    <p
                      className={`text-xs ${checklist[item.id] ? "text-green-700" : "text-muted-foreground"}`}
                    >
                      {item.description}
                    </p>

                    {/* Conditional Note */}
                    {item.note && (
                      <p
                        className={`text-xs px-2 py-1 rounded ${
                          user?.status === "confirmed"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                        }`}
                      >
                        💡 {item.note}
                      </p>
                    )}

                    {/* Action Button */}
                    <Button
                      variant={checklist[item.id] ? "secondary" : "primary"}
                      size="sm"
                      asChild
                      className={`h-8 flex items-center justify-center ${checklist[item.id] ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}`}
                    >
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1"
                      >
                        {checklist[item.id] ? "Completed" : item.linkText}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Success Message */}
        {completedItems === totalItems && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800 font-medium text-center text-sm">
              🎉 All set! You&apos;re ready for MRUHacks!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

const ParticipantDashboard: React.FC<ParticipantDashboardProps> = ({
  user,
}) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">
        MRUHacks Dashboard
      </h1>

      <Checklist user={user} />

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
          <p className="mt-4 text-lg">Hackerpack will be available soon!</p>
        </CardContent>
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
