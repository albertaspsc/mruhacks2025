"use client";

import { useForm } from "react-hook-form";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Save,
  CheckCircle,
  XCircle,
  Mail,
  AlertTriangle,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { getRegistration, Registration } from "@/db/registration";
import { createClient } from "@/utils/supabase/client";
import { z } from "zod";
import { updateUserNameAndEmail, updateUserNameOnly } from "@/db/settings";

// Validation schema
const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
});

// Types
type User = Pick<Registration, "firstName" | "lastName" | "email">;
type ProfileValues = z.infer<typeof profileSchema>;
type ToastType = "success" | "error" | "warning" | "info";

interface ToastState {
  type: ToastType;
  title: string;
  description?: string;
}

const ToastBanner = ({
  toast,
  onClose,
  duration = 5000,
}: {
  toast: ToastState | null;
  onClose: () => void;
  duration?: number;
}) => {
  useEffect(() => {
    if (toast) {
      const timeout = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [toast, duration, onClose]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Mail className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  return (
    <div
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-md shadow-lg z-50 text-sm transition-all duration-300 ${getStyles()} min-w-80 max-w-md`}
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <strong className="block">{toast.title}</strong>
          {toast.description && <div className="mt-1">{toast.description}</div>}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 ml-2"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const supabase = createClient();

  const profileForm = useForm<ProfileValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
    mode: "onChange",
  });

  const showToast = (type: ToastType, title: string, description?: string) => {
    setToast({ type, title, description });
  };

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const { data: registration, error } = await getRegistration();

        if (error) {
          showToast(
            "error",
            "Failed to load profile",
            "Please refresh the page and try again.",
          );
          return;
        }

        if (registration) {
          setUser(registration);
          profileForm.reset({
            firstName: registration.firstName || "",
            lastName: registration.lastName || "",
            email: registration.email || "",
          });
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        showToast(
          "error",
          "Unexpected error",
          "Failed to load your profile data.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  async function onProfileSubmit(data: ProfileValues) {
    const validation = profileSchema.safeParse(data);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      showToast("error", "Validation Error", firstError.message);
      return;
    }

    setIsSaving(true);
    setEmailVerificationSent(false);

    try {
      const emailChanged = data.email !== user?.email;
      const nameChanged =
        data.firstName !== user?.firstName || data.lastName !== user?.lastName;

      if (nameChanged) {
        console.log("Updating name:", {
          firstName: data.firstName,
          lastName: data.lastName,
        });

        const { error: nameUpdateError } = await updateUserNameOnly({
          firstName: data.firstName,
          lastName: data.lastName,
        });

        if (nameUpdateError) {
          console.error("Name update error:", nameUpdateError);
          throw new Error("Failed to update name information");
        }

        // Update local state immediately for name changes
        setUser((prev) =>
          prev
            ? {
                ...prev,
                firstName: data.firstName,
                lastName: data.lastName,
              }
            : null,
        );
      }

      // Handle email change (requires verification)
      if (emailChanged) {
        console.log("Updating email from", user?.email, "to", data.email);

        // this sends verification email
        const { error: emailUpdateError } = await supabase.auth.updateUser({
          email: data.email,
        });

        if (emailUpdateError) {
          console.error("Supabase auth email update error:", emailUpdateError);

          if (emailUpdateError.message.includes("rate limit")) {
            showToast(
              "error",
              "Too many requests",
              "Please wait a moment before trying again.",
            );
            return;
          }

          if (emailUpdateError.message.includes("already registered")) {
            showToast(
              "error",
              "Email already in use",
              "This email is already associated with another account.",
            );
            return;
          }

          throw new Error(emailUpdateError.message || "Failed to update email");
        }

        console.log(
          "Supabase auth email update successful, now storing pending email...",
        );

        try {
          console.log("Calling updateUserNameAndEmail with email:", data.email);

          const result = await updateUserNameAndEmail({
            email: data.email, // This stores as pending_email
          });

          console.log("updateUserNameAndEmail result:", result);

          if (result.error) {
            console.error(
              "Failed to store pending email - detailed error:",
              result.error,
            );
            // Log the type of error to understand what's happening
            console.error("Error type:", typeof result.error);
            console.error("Error keys:", Object.keys(result.error));
            console.error(
              "Error stringified:",
              JSON.stringify(result.error, null, 2),
            );

            // Don't fail the whole operation since auth email was sent successfully
            console.warn("Continuing despite pending email storage failure");
          } else {
            console.log("Pending email stored successfully");
          }
        } catch (pendingEmailError) {
          console.error(
            "Exception while storing pending email:",
            pendingEmailError,
          );
          // Don't fail the whole operation
        }

        setEmailVerificationSent(true);
      }

      if (emailChanged && nameChanged) {
        showToast(
          "info",
          "Updates saved",
          `Name updated successfully. Please check ${data.email} for email verification.`,
        );
      } else if (emailChanged) {
        showToast(
          "info",
          "Verification email sent",
          `Please check ${data.email} and click the verification link to confirm your new email address.`,
        );
      } else if (nameChanged) {
        showToast(
          "success",
          "Profile updated",
          "Your name has been updated successfully.",
        );
      }
    } catch (error: any) {
      console.error("Profile update error:", error);

      if (error.message?.includes("session")) {
        showToast(
          "error",
          "Session expired",
          "Please log in again to continue.",
        );
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      showToast(
        "error",
        "Update failed",
        error.message || "Failed to update your profile. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const handleGoBack = () => {
    router.push("/user/dashboard");
  };

  if (isLoading && !user) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="container max-w-2xl py-10">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Unable to load your profile. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-2xl py-10">
        <ToastBanner toast={toast} onClose={() => setToast(null)} />

        <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
        <p className="text-gray-500 mb-6">Manage your personal information</p>

        {emailVerificationSent && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Mail className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">
              Email verification sent
            </AlertTitle>
            <AlertDescription className="text-blue-700">
              We&apos;ve sent a verification email to your new address. Please
              check your inbox and click the verification link to confirm the
              change.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your name and email address. Email changes require
              verification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <FormField
                    control={profileForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your first name"
                            {...field}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your last name"
                            {...field}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email address"
                          type="email"
                          {...field}
                          disabled={isSaving}
                        />
                      </FormControl>
                      <FormDescription>
                        This email is used for login and all communications.
                        Changing it will require email verification.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>Save Changes</>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Additional Info Alert */}
        <Alert className="mt-6 rounded-xl">
          <Mail className="h-4 w-4" />
          <AlertTitle>Email Change Security</AlertTitle>
          <AlertDescription>
            For security reasons, email changes require verification.
            You&apos;ll receive an email at your new address with a verification
            link. Your login email won&apos;t change until you verify the new
            address.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
