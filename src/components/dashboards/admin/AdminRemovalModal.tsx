"use client";

import React, { useState } from "react";
import { X, UserMinus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminErrorHandler } from "@/utils/admin/errorHandler";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
type UserForRemoval = Participant | AdminUser;

interface AdminRemovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: UserForRemoval | null;
  onRemove?: (participantId: string) => Promise<void>;
  // When provided and mode is "role", modal becomes a Change Role modal
  onChangeRole?: (
    participantId: string,
    newRole: "admin" | "super_admin" | "volunteer",
  ) => Promise<void>;
  mode?: "remove" | "role";
}

export function AdminRemovalModal({
  isOpen,
  onClose,
  participant,
  onRemove,
  onChangeRole,
  mode = "remove",
}: AdminRemovalModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [selectedRole, setSelectedRole] = useState<
    "admin" | "super_admin" | "volunteer"
  >("admin");

  // Reset form when modal opens/closes or participant changes
  React.useEffect(() => {
    if (isOpen && participant) {
      setConfirmText("");
      if (mode === "role") {
        const isAdminUser = "role" in participant;
        setSelectedRole(isAdminUser ? participant.role : "admin");
      }
    }
  }, [isOpen, participant, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!participant) return;

    setIsSubmitting(true);
    try {
      if (mode === "role") {
        if (!onChangeRole) {
          throw new Error("onChangeRole handler is not provided");
        }
        await onChangeRole(participant.id, selectedRole);
      } else {
        // Validate confirmation text for removal
        if (confirmText !== "REMOVE") {
          AdminErrorHandler.showErrorToast("Please type 'REMOVE' to confirm");
          return;
        }
        if (!onRemove) {
          throw new Error("onRemove handler is not provided");
        }
        await onRemove(participant.id);
      }
      onClose();
    } catch (error) {
      console.error(
        mode === "role" ? "Error changing role:" : "Error removing admin:",
        error,
      );
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
            <UserMinus
              className={`h-5 w-5 ${mode === "role" ? "text-blue-600" : "text-red-600"}`}
            />
            <h2 className="text-lg font-semibold text-gray-900">
              {mode === "role"
                ? "Change Admin Role"
                : "Remove Admin Privileges"}
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
          {/* Warning / Info */}
          {mode === "role" ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-800">
                <p className="font-medium">Update Role</p>
                <p>
                  Choose a new role for{" "}
                  <span className="font-semibold">
                    {"role" in participant
                      ? `${participant.firstName || ""} ${participant.lastName || ""}`.trim()
                      : `${participant.f_name || ""} ${participant.l_name || ""}`.trim()}
                  </span>
                  .
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Warning</p>
                  <p>
                    This will remove admin privileges from{" "}
                    <span className="font-semibold">
                      {"role" in participant
                        ? `${participant.firstName || ""} ${participant.lastName || ""}`.trim()
                        : `${participant.f_name || ""} ${participant.l_name || ""}`.trim()}
                    </span>
                    . They will no longer have access to admin features.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              {mode === "role" ? "Admin" : "Admin to Remove"}
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
              {"role" in participant && (
                <p>
                  <span className="font-medium">Current Role:</span>{" "}
                  {participant.role}
                </p>
              )}
            </div>
          </div>

          {mode === "role" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Role
              </label>
              <Select
                value={selectedRole}
                onValueChange={(value: "admin" | "super_admin" | "volunteer") =>
                  setSelectedRole(value)
                }
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
          ) : (
            <div>
              <label
                htmlFor="confirmText"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Type &quot;REMOVE&quot; to confirm *
              </label>
              <input
                id="confirmText"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type REMOVE to confirm"
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          )}

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
              disabled={
                isSubmitting || (mode === "remove" && confirmText !== "REMOVE")
              }
              className={
                mode === "role"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
            >
              {isSubmitting
                ? mode === "role"
                  ? "Saving..."
                  : "Removing..."
                : mode === "role"
                  ? "Save Role"
                  : "Remove Admin Privileges"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
