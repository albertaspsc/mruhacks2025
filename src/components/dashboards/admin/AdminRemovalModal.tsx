"use client";

import React, { useState } from "react";
import { X, UserMinus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface AdminRemovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: Participant | null;
  onRemove: (participantId: string) => Promise<void>;
}

export function AdminRemovalModal({
  isOpen,
  onClose,
  participant,
  onRemove,
}: AdminRemovalModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // Reset form when modal opens/closes or participant changes
  React.useEffect(() => {
    if (isOpen && participant) {
      setConfirmText("");
    }
  }, [isOpen, participant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!participant) return;

    // Validate confirmation text
    if (confirmText !== "REMOVE") {
      AdminErrorHandler.showErrorToast("Please type 'REMOVE' to confirm");
      return;
    }

    setIsSubmitting(true);
    try {
      await onRemove(participant.id);
      onClose();
    } catch (error) {
      console.error("Error removing admin:", error);
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
            <UserMinus className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Remove Admin Privileges
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium">Warning</p>
                <p>
                  This will remove admin privileges from{" "}
                  <span className="font-semibold">
                    {participant.f_name} {participant.l_name}
                  </span>
                  . They will no longer have access to admin features.
                </p>
              </div>
            </div>
          </div>

          {/* Participant Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Admin to Remove
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Name:</span> {participant.f_name}{" "}
                {participant.l_name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {participant.email}
              </p>
            </div>
          </div>

          {/* Confirmation */}
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
              disabled={isSubmitting || confirmText !== "REMOVE"}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? "Removing..." : "Remove Admin Privileges"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
