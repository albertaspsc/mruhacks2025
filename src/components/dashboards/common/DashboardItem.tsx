import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardItemProps {
  title: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

const DashboardItem = ({
  title,
  children,
  className = "",
  headerClassName = "",
  contentClassName = "py-2 px-3",
}: DashboardItemProps) => {
  return (
    <Card className={`mb-0 shadow-sm rounded-xl overflow-hidden ${className}`}>
      <CardHeader className={`py-2 px-3 ${headerClassName}`}>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
};

export default DashboardItem;
