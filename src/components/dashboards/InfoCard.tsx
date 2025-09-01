import React from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InfoCardProps {
  description: string;
  linkUrl?: string;
  linkText?: string;
  icon?: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({
  description,
  linkUrl,
  linkText = "Learn More",
  icon,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2">
        {icon && <div className="mt-0.5 flex-shrink-0">{icon}</div>}
        <div>
          <p className="text-sm">{description}</p>
        </div>
      </div>

      {linkUrl && (
        <Button
          variant="secondary"
          className="flex items-center gap-1 w-fit text-sm px-2 py-1 rounded-xl"
          asChild
        >
          <a href={linkUrl} target="_blank" rel="noopener noreferrer">
            {linkText}
            <ExternalLink className="h-4 w-4 ml-1" />
          </a>
        </Button>
      )}
    </div>
  );
};

export default InfoCard;
