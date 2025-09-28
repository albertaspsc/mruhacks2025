"use client";

import React from "react";
import Link from "next/link";
import { UserCheck, LogOut, Home } from "lucide-react";

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pt-[70px] bg-gray-50">
      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
