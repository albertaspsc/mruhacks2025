"use client";
import React, { useState, useEffect } from "react";
import {
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Save,
} from "lucide-react";

interface AdminSettingsPageProps {
  className?: string;
}

export default function AdminSettingsPage({
  className = "",
}: AdminSettingsPageProps) {
  const [adminInfo, setAdminInfo] = useState({
    email: "",
    role: "",
    createdAt: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password validation
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    match: false,
  });

  // Fetch admin information
  const fetchAdminInfo = async () => {
    setLoading(true);
    try {
      // Replace with your API call
      const response = await fetch("/api/admin/profile");
      const data = await response.json();

      if (data.success) {
        setAdminInfo(data.admin);
      } else {
        // Mock data for demonstration
        setAdminInfo({
          email: "admin@mruhacks.ca",
          role: "admin",
          createdAt: "2024-01-15T10:30:00Z",
        });
      }
    } catch (error) {
      console.error("Error fetching admin info:", error);
      // Mock data fallback
      setAdminInfo({
        email: "admin@mruhacks.ca",
        role: "admin",
        createdAt: "2024-01-15T10:30:00Z",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const handlePasswordUpdate = async () => {
    if (
      !passwordValidation.length ||
      !passwordValidation.uppercase ||
      !passwordValidation.lowercase ||
      !passwordValidation.number ||
      !passwordValidation.match
    ) {
      setMessage({
        type: "error",
        text: "Please ensure all password requirements are met",
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: "success", text: "Password updated successfully!" });
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to update password",
        });
      }
    } catch (error) {
      console.error("Error updating password:", error);
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  // Validate password as user types
  useEffect(() => {
    const { newPassword, confirmPassword } = passwordForm;

    setPasswordValidation({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /\d/.test(newPassword),
      match: newPassword === confirmPassword && newPassword.length > 0,
    });
  }, [passwordForm.newPassword, passwordForm.confirmPassword]);

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    fetchAdminInfo();
  }, []);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "volunteer":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-500">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">
          Manage your admin account settings and security
        </p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`rounded-lg p-4 flex items-center space-x-2 ${
            message.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
          <span
            className={`text-sm font-medium ${
              message.type === "success" ? "text-green-800" : "text-red-800"
            }`}
          >
            {message.text}
          </span>
        </div>
      )}

      {/* Account Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Account Information
          </h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{adminInfo.email}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This email is used for admin communications and login
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(adminInfo.role)}`}
              >
                {adminInfo.role.charAt(0).toUpperCase() +
                  adminInfo.role.slice(1)}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Created
              </label>
              <span className="text-gray-900">
                {new Date(adminInfo.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Password Update */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Lock className="h-5 w-5 mr-2" />
            Update Password
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Choose a strong password to keep your admin account secure
          </p>
        </div>
        <div className="px-6 py-4">
          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            {passwordForm.newPassword && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Password Requirements:
                </h4>
                <div className="space-y-1">
                  <div
                    className={`flex items-center text-xs ${passwordValidation.length ? "text-green-600" : "text-gray-500"}`}
                  >
                    <CheckCircle
                      className={`h-3 w-3 mr-1 ${passwordValidation.length ? "text-green-600" : "text-gray-400"}`}
                    />
                    At least 8 characters
                  </div>
                  <div
                    className={`flex items-center text-xs ${passwordValidation.uppercase ? "text-green-600" : "text-gray-500"}`}
                  >
                    <CheckCircle
                      className={`h-3 w-3 mr-1 ${passwordValidation.uppercase ? "text-green-600" : "text-gray-400"}`}
                    />
                    One uppercase letter
                  </div>
                  <div
                    className={`flex items-center text-xs ${passwordValidation.lowercase ? "text-green-600" : "text-gray-500"}`}
                  >
                    <CheckCircle
                      className={`h-3 w-3 mr-1 ${passwordValidation.lowercase ? "text-green-600" : "text-gray-400"}`}
                    />
                    One lowercase letter
                  </div>
                  <div
                    className={`flex items-center text-xs ${passwordValidation.number ? "text-green-600" : "text-gray-500"}`}
                  >
                    <CheckCircle
                      className={`h-3 w-3 mr-1 ${passwordValidation.number ? "text-green-600" : "text-gray-400"}`}
                    />
                    One number
                  </div>
                  <div
                    className={`flex items-center text-xs ${passwordValidation.match ? "text-green-600" : "text-gray-500"}`}
                  >
                    <CheckCircle
                      className={`h-3 w-3 mr-1 ${passwordValidation.match ? "text-green-600" : "text-gray-400"}`}
                    />
                    Passwords match
                  </div>
                </div>
              </div>
            )}

            {/* Update Button */}
            <div className="pt-4">
              <button
                onClick={handlePasswordUpdate}
                disabled={
                  saving ||
                  !passwordForm.currentPassword ||
                  !passwordValidation.length ||
                  !passwordValidation.uppercase ||
                  !passwordValidation.lowercase ||
                  !passwordValidation.number ||
                  !passwordValidation.match
                }
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Security Notice
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Keep your admin credentials secure. Never share your password with
              anyone. If you suspect your account has been compromised, update
              your password immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
