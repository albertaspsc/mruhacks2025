"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar } from "lucide-react";

export default function TabNavigation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = searchParams.get("tab") || "participants";

  useEffect(() => {
    if (!searchParams.get("tab")) {
      router.replace("/admin/dashboard?tab=participants");
    }
  }, [searchParams, router]);

  const handleTabChange = (tab: string) => {
    const newUrl = `/admin/dashboard?tab=${tab}`;
    router.push(newUrl, { scroll: false });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="participants" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Participants
        </TabsTrigger>
        <TabsTrigger value="workshops" className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Workshops
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
