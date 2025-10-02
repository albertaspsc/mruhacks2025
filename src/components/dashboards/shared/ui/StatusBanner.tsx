"use client";

import React from "react";
import { CheckCircle, Clock, AlertTriangle, XCircle, Ban } from "lucide-react";
import { useRegistrationStatus } from "@/app/user/dashboard/rsvp/states";

export type RegistrationStatus =
  | "confirmed"
  | "pending"
  | "waitlisted"
  | "declined"
  | "denied";

interface StatusBannerProps {
  status: RegistrationStatus;
}

function StatusBanner({ status }: StatusBannerProps) {
  const liveStatus = useRegistrationStatus();

  // Use the live status once it loads
  if (!liveStatus.loading) status = liveStatus.status;

  const config = {
    confirmed: {
      bgColor: "bg-green-100",
      borderColor: "border-green-400",
      textColor: "text-green-800",
      icon: <CheckCircle className="h-5 w-5 text-green-500 mr-2" />,
      title: "Registration Confirmed",
      message:
        "Your registration has been confirmed. We look forward to seeing you at the event!",
    },
    pending: {
      bgColor: "bg-blue-100",
      borderColor: "border-blue-400",
      textColor: "text-blue-800",
      icon: <Clock className="h-5 w-5 text-blue-500 mr-2" />,
      title: "Registration Pending",
      message:
        "Your registration is currently under review. Please check back later for updates.",
    },
    waitlisted: {
      bgColor: "bg-yellow-100",
      borderColor: "border-yellow-400",
      textColor: "text-yellow-800",
      icon: <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />,
      title: "Waitlisted",
      message:
        "You've been added to our waitlist. We'll notify you if a spot becomes available.",
    },
    declined: {
      bgColor: "bg-gray-100",
      borderColor: "border-gray-400",
      textColor: "text-gray-800",
      icon: <XCircle className="h-5 w-5 text-gray-500 mr-2" />,
      title: "Application Declined",
      message:
        "Your application has been withdrawn or forfeited due to not confirming attendance in time.",
    },
    denied: {
      bgColor: "bg-red-100",
      borderColor: "border-red-400",
      textColor: "text-red-800",
      icon: <Ban className="h-5 w-5 text-red-500 mr-2" />,
      title: "Application Denied",
      message:
        "Your application has been reviewed and denied by the team. Thank you for your interest.",
    },
  } as const;

  const { bgColor, borderColor, textColor, icon, title, message } =
    config[status];

  return (
    <div
      className={`mb-4 md:mb-6 rounded-xl border ${borderColor} ${bgColor} p-3 md:p-4`}
    >
      <div className="flex items-center">
        {icon}
        <h2 className={`font-semibold ${textColor} text-sm md:text-base`}>
          {title}
        </h2>
      </div>
      <p className={`mt-2 ${textColor} text-xs md:text-sm`}>{message}</p>
    </div>
  );
}

export default StatusBanner;
