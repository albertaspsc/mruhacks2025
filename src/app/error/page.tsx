"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from "lucide-react";

export default function ErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState("");
  const [errorCode, setErrorCode] = useState("");

  useEffect(() => {
    // Get error details from URL parameters
    const message = searchParams.get("message");
    const code = searchParams.get("code");

    setErrorMessage(message || "");
    setErrorCode(code || "");
  }, [searchParams]);

  const getErrorTitle = () => {
    switch (errorMessage) {
      case "auth_failed":
        return "Authentication Failed";
      case "database_error":
        return "Database Connection Error";
      case "profile_creation_failed":
        return "Profile Creation Failed";
      case "check_registration_failed":
        return "Registration Check Failed";
      case "no_auth_code":
        return "Authentication Code Missing";
      default:
        return "Something Went Wrong";
    }
  };

  const getErrorDescription = () => {
    switch (errorMessage) {
      case "auth_failed":
        return "We couldn't authenticate your account. This might be due to an expired session or invalid credentials.";
      case "database_error":
        return "We're having trouble connecting to our database. Please try again in a few moments.";
      case "profile_creation_failed":
        return "We couldn't create your profile. This might be a temporary issue with our system.";
      case "check_registration_failed":
        return "We couldn't verify your registration status. Please try logging in again.";
      case "no_auth_code":
        return "The authentication process was incomplete. Please try signing in again.";
      default:
        return "An unexpected error occurred. Our team has been notified and we're working to fix this issue.";
    }
  };

  const getSuggestedActions = () => {
    switch (errorMessage) {
      case "auth_failed":
      case "no_auth_code":
        return [
          {
            label: "Try Signing In Again",
            action: () => router.push("/login"),
            primary: true,
          },
          {
            label: "Create New Account",
            action: () => router.push("/register"),
          },
        ];
      case "database_error":
      case "profile_creation_failed":
        return [
          {
            label: "Try Again",
            action: () => window.location.reload(),
            primary: true,
          },
          { label: "Go to Homepage", action: () => router.push("/") },
        ];
      case "check_registration_failed":
        return [
          {
            label: "Complete Registration",
            action: () => router.push("/register"),
            primary: true,
          },
          { label: "Sign In", action: () => router.push("/login") },
        ];
      default:
        return [
          {
            label: "Try Again",
            action: () => window.location.reload(),
            primary: true,
          },
          { label: "Go to Homepage", action: () => router.push("/") },
        ];
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {getErrorTitle()}
        </h1>

        {/* Error Description */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          {getErrorDescription()}
        </p>

        {/* Error Code (if available) */}
        {errorCode && (
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">
              Error Code:{" "}
              <span className="font-mono font-medium">{errorCode}</span>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          {getSuggestedActions().map((action, index) => (
            <Button
              key={index}
              onClick={action.action}
              className={`w-full ${
                action.primary
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {action.primary && <RefreshCw className="w-4 h-4 mr-2" />}
              {action.label}
            </Button>
          ))}
        </div>

        {/* Additional Actions */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleGoBack}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Go Back
            </button>
            <button
              onClick={() => router.push("/")}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Home className="w-4 h-4 mr-1" />
              Homepage
            </button>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Still having trouble?{" "}
            <a
              href="mailto:support@mruhacks.ca"
              className="font-medium underline hover:no-underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
