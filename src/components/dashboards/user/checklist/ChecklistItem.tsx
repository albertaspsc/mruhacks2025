import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink } from "lucide-react";
import { ChecklistState } from "./types";

export interface ChecklistItem {
  id: keyof ChecklistState;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  linkText: string;
  required: boolean;
  note: string | null;
}

export interface ChecklistItemProps {
  item: ChecklistItem;
  checked: boolean;
  onCheckedChange: () => void;
  userStatus?: string;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({
  item,
  checked,
  onCheckedChange,
  userStatus,
}) => {
  return (
    <div
      className={`p-2 border rounded-xl transition-all duration-200 ${checked ? "bg-green-50 border-green-200" : "hover:shadow-sm"}`}
    >
      <div className="flex items-start gap-2">
        {/* Checkbox */}
        <div className="flex-shrink-0 pt-0.5">
          <Checkbox
            id={item.id}
            checked={checked}
            onCheckedChange={onCheckedChange}
            className="h-4 w-4"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            {item.icon}
            <h4
              className={`font-medium text-xs ${checked ? "text-green-800" : "text-foreground"} truncate`}
            >
              {item.title}
              {item.required && <span className="text-destructive">*</span>}
            </h4>
          </div>

          <div className="flex justify-between items-center gap-2">
            <p
              className={`text-xs line-clamp-1 ${checked ? "text-green-700" : "text-muted-foreground"}`}
            >
              {item.description}
            </p>

            <Button asChild variant="ghost" className="h-6 p-0 text-xs">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1"
              >
                {checked ? "Completed" : "Link"}
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </Button>
          </div>

          {/* Conditional Note - Shown only if exists */}
          {item.note && (
            <p
              className={`text-xs mt-1 px-1.5 py-0.5 rounded-xl ${userStatus === "confirmed" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}
            >
              💡 {item.note}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChecklistItem;
