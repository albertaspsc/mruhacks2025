import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface CompactStatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function CompactStatsCard({
  title,
  value,
  icon: Icon,
  className = "",
}: CompactStatsCardProps) {
  return (
    <Card className={`p-2 ${className}`}>
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Icon className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">
              {title}
            </span>
          </div>
          <span className="text-sm font-bold">{value}</span>
        </div>
      </CardContent>
    </Card>
  );
}
