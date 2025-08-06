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
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Registration } from "@/db/registration";

type DashboardView = "dashboard" | "settings" | "profile";

// Interface for navigation items
interface NavItem {
  title: string;
  view?: DashboardView; // For internal navigation
  href?: string; // For external links
  icon: React.ReactNode;
  external?: boolean;
  onClick?: () => void;
  isPopover?: boolean;
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  user?: Registration;
  onLogout?: () => void;
  onNavigate?: (view: DashboardView) => void; // Navigation handler
  currentView?: DashboardView; // Current active view
}

export function Sidebar({
  className,
  user,
  onLogout,
  onNavigate,
  currentView = "dashboard",
  ...props
}: SidebarProps) {
  const userName = user?.firstName || "Hacker";

  const topNavItems: NavItem[] = [
    {
      title: "Dashboard",
      view: "dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Profile",
      view: "profile",
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
      icon: <HelpCircle className="h-5 w-5" />,
      isPopover: true,
    },
  ];

  const bottomNavItems: NavItem[] = [
    {
      title: "Settings",
      view: "settings",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      title: "Logout",
      icon: <LogOut className="h-5 w-5" />,
      onClick: onLogout,
    },
  ];

  const handleNavClick = (item: NavItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.view && onNavigate) {
      onNavigate(item.view);
    }
  };

  const isActive = (item: NavItem) => {
    return item.view === currentView;
  };

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
              ) : item.href && item.external ? (
                // External links
                <Link
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="ghost"
                    className="w-full flex items-center justify-start h-10"
                  >
                    <div className="flex items-center">
                      {item.icon}
                      <span className="ml-2">{item.title}</span>
                    </div>
                  </Button>
                </Link>
              ) : (
                // Internal navigation
                <Button
                  key={item.title}
                  variant={isActive(item) ? "secondary" : "ghost"}
                  className="w-full flex items-center justify-start h-10"
                  onClick={() => handleNavClick(item)}
                >
                  <div className="flex items-center">
                    {item.icon}
                    <span className="ml-2">{item.title}</span>
                  </div>
                </Button>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Bottom navigation with mobile-safe padding */}
      <div className="px-3 py-2 pb-6 sm:pb-2">
        <div className="space-y-1">
          {bottomNavItems.map((item) => (
            <Button
              key={item.title}
              variant={isActive(item) ? "secondary" : "ghost"}
              className={cn(
                "w-full flex items-center justify-start h-12 sm:h-10", // Increased height on mobile
                item.title === "Logout" &&
                  "text-red-600 hover:text-red-700 hover:bg-red-50",
              )}
              onClick={() => handleNavClick(item)}
            >
              <div className="flex items-center">
                {item.icon}
                <span className="ml-2">{item.title}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
