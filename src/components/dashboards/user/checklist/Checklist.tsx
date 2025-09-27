"use client";
import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, Trophy, AlertCircle, Loader2 } from "lucide-react";
import { UserRegistration } from "@/types/registration";
import ProgressBar from "@/components/forms/register/ProgressBar";
import ChecklistItem, {
  ChecklistItem as ChecklistItemType,
} from "./ChecklistItem";
import { ChecklistState } from "./types";

interface ChecklistProps {
  user?: UserRegistration;
}

const Checklist: React.FC<ChecklistProps> = ({ user }) => {
  const [checklist, setChecklist] = useState<ChecklistState>({
    discordJoined: false,
    devpostSignup: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate loading checklist data
  useEffect(() => {
    const loadChecklist = async () => {
      try {
        setLoading(true);
        setError(null);

        // In a real app, we would load actual data from an API here
        // For now, we'll just use the initial state

        // Set loading to false immediately since we're not actually loading data
        setLoading(false);
      } catch (err) {
        setError("Failed to load checklist data");
        setLoading(false);
        console.error("Error loading checklist:", err);
      }
    };

    loadChecklist();
  }, []);

  const handleChecklistChange = async (item: keyof ChecklistState) => {
    try {
      // Optimistically update UI
      setChecklist((prev) => ({
        ...prev,
        [item]: !prev[item],
      }));

      // In a real app, we would make an API call here to persist the change
      // await saveChecklistStatus(item, !checklist[item]);

      // If there was an error with the API call, we could revert the UI change
    } catch (err) {
      // Revert the optimistic update if the API call fails
      setChecklist((prev) => ({
        ...prev,
        [item]: checklist[item],
      }));

      setError("Failed to update checklist item");
      console.error("Error updating checklist:", err);
    }
  };

  const checklistItems: ChecklistItemType[] = [
    {
      id: "discordJoined",
      title: "Join our Discord server",
      description: "Connect with other participants and get real-time updates",
      icon: <MessageSquare className="w-4 h-4" />,
      link: "https://discord.com/invite/e7Fg6jsnrm",
      linkText: "Join Discord",
      required: true,
      note: null,
    },
    {
      id: "devpostSignup",
      title: "Sign up through DevPost",
      description: "Required for project submission and judging",
      icon: <Trophy className="w-4 h-4" />,
      link: "https://devpost.com/mruhacks", // Replace with actual DevPost link
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-4 space-y-2">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading checklist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="py-2 border-red-200 bg-red-50 rounded-xl">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700 font-medium text-xs">
            {error} -{" "}
            <button
              className="underline"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </AlertDescription>
        </div>
      </Alert>
    );
  }

  return (
    <div>
      {/* Progress Section */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
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

      {/* Checklist Items - Compact Version */}
      <div className="space-y-2">
        {checklistItems.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            checked={checklist[item.id]}
            onCheckedChange={() => handleChecklistChange(item.id)}
            userStatus={user?.status}
          />
        ))}
      </div>

      {/* Success Message - More compact */}
      {completedItems === totalItems && (
        <Alert className="mt-2 py-1.5 border-green-200 bg-green-50 rounded-xl">
          <AlertDescription className="text-green-800 font-medium text-center text-xs">
            🎉 All set! You&apos;re ready for MRUHacks!
          </AlertDescription>
        </Alert>
      )}

      {/* Error notification if something fails during an action */}
      {error && (
        <Alert className="mt-2 py-1.5 border-red-200 bg-red-50 rounded-xl">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700 text-xs">
              {error}
            </AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  );
};

export default Checklist;
