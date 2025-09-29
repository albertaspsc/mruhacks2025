import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DistributionItem {
  label: string;
  count: number;
  percentage: number;
}

interface CompactDistributionTableProps {
  title: string;
  data: DistributionItem[];
  maxItems?: number;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function CompactDistributionTable({
  title,
  data,
  maxItems = 8,
  icon: Icon,
  className = "",
}: CompactDistributionTableProps) {
  const displayData = data.slice(0, maxItems);
  const remainingCount = data.length - maxItems;

  return (
    <Card className={`p-3 ${className}`}>
      <CardHeader className="p-0 pb-2">
        <CardTitle className="text-sm font-semibold flex items-center">
          <Icon className="w-3 h-3 mr-1" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {displayData.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-xs"
            >
              <span className="truncate flex-1 mr-2">{item.label}</span>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <div className="w-16 bg-gray-200 rounded-full h-1">
                  <div
                    className="bg-blue-600 h-1 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right">{item.count}</span>
              </div>
            </div>
          ))}
          {remainingCount > 0 && (
            <div className="text-xs text-gray-500 text-center pt-1">
              +{remainingCount} more
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
