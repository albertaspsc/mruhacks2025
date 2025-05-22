"use client";

import React from "react";
import { cn } from "@/components/lib/utils";
import { Button } from "@/components/ui/button";
import {
  User,
  Settings,
  HelpCircle,
  LogOut,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Interface for navigation items
interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
  onClick?: () => void;
  isPopover?: boolean;
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  user?: {
    name: string;
    [key: string]: any;
  };
  onLogout?: () => void; // Logout handler prop
}

export function Sidebar({ className, user, onLogout, ...props }: SidebarProps) {
  const pathname = usePathname();
  const userName = user?.name?.split(" ")[0] || "Hacker";

  const topNavItems: NavItem[] = [
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: <User className="h-5 w-5" />,
    },
    {
      title: "Discord",
      href: "https://discord.gg/e7Fg6jsnrm",
      icon: <MessageSquare className="h-5 w-5" />,
      external: true,
    },
    {
      title: "Support",
      href: "#",
      icon: <HelpCircle className="h-5 w-5" />,
      isPopover: true,
    },
  ];

  const bottomNavItems: NavItem[] = [
    {
      title: "Settings",
      href: "/user/settings",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      title: "Logout",
      href: "/",
      icon: <LogOut className="h-5 w-5" />,
      onClick: onLogout,
    },
  ];

  return (
    <div
      className={cn("pb-12 h-full flex flex-col justify-between", className)}
      {...props}
    >
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">
            Hello, {userName}!
          </h2>
          <div className="space-y-1">
            {topNavItems.map((item) =>
              item.isPopover ? (
                <Popover key={item.title}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-start h-10"
                    >
                      <div className="flex items-center">
                        {item.icon}
                        <span className="ml-2">{item.title}</span>
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-medium text-lg">Need Help?</h4>
                      <p className="text-sm text-gray-500">
                        Have a question that isn&apos;t included in the FAQ?
                        Send us your question in the Discord server or email us
                        at:
                      </p>
                      <p className="text-sm font-medium text-purple-600">
                        hello@mruhacks.ca
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : item.onClick ? (
                <Button
                  key={item.title}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full flex items-center justify-start h-10"
                  onClick={item.onClick}
                >
                  <div className="flex items-center">
                    {item.icon}
                    <span className="ml-2">{item.title}</span>
                  </div>
                </Button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                >
                  <Button
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className="w-full flex items-center justify-start h-10"
                  >
                    <div className="flex items-center">
                      {item.icon}
                      <span className="ml-2">{item.title}</span>
                    </div>
                  </Button>
                </Link>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="px-3 py-2">
        <div className="space-y-1">
          {bottomNavItems.map((item) =>
            item.onClick ? (
              <Button
                key={item.title}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="w-full flex items-center justify-start h-10"
                onClick={item.onClick}
              >
                <div className="flex items-center">
                  {item.icon}
                  <span className="ml-2">{item.title}</span>
                </div>
              </Button>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
              >
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full flex items-center justify-start h-10"
                >
                  <div className="flex items-center">
                    {item.icon}
                    <span className="ml-2">{item.title}</span>
                  </div>
                </Button>
              </Link>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
