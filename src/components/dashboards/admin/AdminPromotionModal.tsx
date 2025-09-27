"use client";

import React, { useState } from "react";
import { X, UserPlus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminErrorHandler } from "@/utils/admin/errorHandler";

interface Participant {
  id: string;
  f_name?: string;
  l_name?: string;
  email?: string;
  status?: "confirmed" | "pending" | "waitlisted";
  checked_in?: boolean;
  university?: string;
  gender?: string;
  timestamp?: string;
}

interface AdminUser {
  id: string;
  email: string;
  role: "admin" | "super_admin" | "volunteer";
  status: "active" | "inactive" | "suspended";
  firstName?: string;
  lastName?: string;
  isAdminOnly?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastSignInAt?: string;
  emailConfirmedAt?: string;
}

// Union type that can handle both Participant and AdminUser
type UserForPromotion = Participant | AdminUser;

interface AdminPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: UserForPromotion | null;
  onPromote: (
    participantId: string,
    adminData: AdminPromotionData,
  ) => Promise<void>;
}

export interface AdminPromotionData {
  role: "admin" | "super_admin" | "volunteer";
  status: "active" | "inactive";
  fName: string;
  lName: string;
  email: string;
}

export function AdminPromotionModal({
  isOpen,
  onClose,
  participant,
  onPromote,
}: AdminPromotionModalProps) {
  const [formData, setFormData] = useState<AdminPromotionData>({
    role: "admin",
    status: "active",
    fName: "",
    lName: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // Reset form when modal opens/closes or participant changes
  React.useEffect(() => {
    if (isOpen && participant) {
      // Handle both Participant and AdminUser types
      const isAdminUser = "role" in participant;
      setFormData({
        role: isAdminUser ? participant.role : "admin",
        status: isAdminUser
          ? participant.status === "suspended"
            ? "inactive"
            : participant.status
          : "active",
        fName: isAdminUser
          ? participant.firstName || ""
          : participant.f_name || "",
        lName: isAdminUser
          ? participant.lastName || ""
          : participant.l_name || "",
        email: participant.email || "",
      });
      setConfirmText("");
    }
  }, [isOpen, participant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!participant) return;

    // Validate confirmation text
    if (confirmText !== "PROMOTE") {
      AdminErrorHandler.showErrorToast("Please type 'PROMOTE' to confirm");
      return;
    }

    // Validate required fields (name and email are pre-filled from participant data)
    if (
      !formData.fName.trim() ||
      !formData.lName.trim() ||
      !formData.email.trim()
    ) {
      AdminErrorHandler.showErrorToast("Participant information is missing");
      return;
    }

    setIsSubmitting(true);
    try {
      await onPromote(participant.id, formData);
      onClose();
    } catch (error) {
      console.error("Error promoting user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen || !participant) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Promote to Admin
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Warning</p>
                <p>
                  This will grant admin privileges to{" "}
                  <span className="font-semibold">
                    {"role" in participant
                      ? `${participant.firstName || ""} ${participant.lastName || ""}`.trim()
                      : `${participant.f_name || ""} ${participant.l_name || ""}`.trim()}
                  </span>
                  . This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Current User Information
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Name:</span>{" "}
                {"role" in participant
                  ? `${participant.firstName || ""} ${participant.lastName || ""}`.trim()
                  : `${participant.f_name || ""} ${participant.l_name || ""}`.trim()}
              </p>
              <p>
                <span className="font-medium">Email:</span> {participant.email}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                {participant.status}
              </p>
              {"role" in participant && (
                <p>
                  <span className="font-medium">Current Role:</span>{" "}
                  {participant.role}
                </p>
              )}
            </div>
          </div>

          {/* Admin Details Form */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">
              Admin Account Settings
            </h3>

            {/* Role and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Admin Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(
                    value: "admin" | "super_admin" | "volunteer",
                  ) => setFormData({ ...formData, role: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive") =>
                    setFormData({ ...formData, status: value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Confirmation */}
            <div>
              <Label htmlFor="confirmText">
                Type &quot;PROMOTE&quot; to confirm *
              </Label>
              <Input
                id="confirmText"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type PROMOTE to confirm"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || confirmText !== "PROMOTE"}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Promoting..." : "Promote to Admin"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
