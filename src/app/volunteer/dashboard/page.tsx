"use client";

import React from "react";
import { ParticipantManagement } from "@/components/dashboards/admin/ParticipantManagement";
import { UserCheck, Eye, Clock, Users } from "lucide-react";

export default function VolunteerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Volunteer Dashboard
                </h1>
                <p className="mt-2 text-gray-600">
                  Check participants in and out for the event
                </p>
              </div>
              <div className="flex items-center space-x-2 text-blue-600">
                <UserCheck className="h-8 w-8" />
                <span className="text-lg font-semibold">Check-In Station</span>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions for Volunteers */}
        <div className="mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <UserCheck className="h-6 w-6 text-blue-600 mt-1" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-blue-900">
                  Volunteer Instructions
                </h3>
                <div className="mt-2 text-blue-800">
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      <strong>Check participants in:</strong> Click the
                      &quot;Check In&quot; button when participants arrive
                    </li>
                    <li>
                      <strong>Search for participants:</strong> Use the search
                      bar to find specific attendees
                    </li>
                    <li>
                      <strong>View only:</strong> You can see participant
                      information but cannot change their status
                    </li>
                    <li>
                      <strong>Need help?</strong> Contact an event planner if
                      you encounter any issues
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Participant Management with Volunteer Permissions */}
        <div className="bg-white rounded-lg shadow">
          <ParticipantManagement
            userRole="volunteer"
            readOnly={false} // They can check in/out, but not change status
            className="border-0 shadow-none"
          />
        </div>
      </div>
    </div>
  );
}
