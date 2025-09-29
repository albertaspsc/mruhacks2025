"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, BarChart3, Shield } from "lucide-react";

export default function TabNavigation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = searchParams.get("tab") || "stats";

  useEffect(() => {
    if (!searchParams.get("tab")) {
      router.replace("/admin/dashboard?tab=stats");
    }
  }, [searchParams, router]);

  const handleTabChange = (tab: string) => {
    const newUrl = `/admin/dashboard?tab=${tab}`;
    router.push(newUrl, { scroll: false });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="participants" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Participants
        </TabsTrigger>
        <TabsTrigger value="admins" className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Admins
        </TabsTrigger>
        <TabsTrigger value="workshops" className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Workshops
        </TabsTrigger>
        <TabsTrigger value="stats" className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Statistics
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
