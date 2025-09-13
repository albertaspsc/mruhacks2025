"use client";

import { useForm } from "react-hook-form";
import React, { useState } from "react";
import { redirect } from "next/navigation";
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
import { Loader2, Mail } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/utils/supabase/client";
import { z } from "zod";
import { updateUserNameAndEmail, updateUserNameOnly } from "@/db/settings";
import {
  ToastBanner,
  ToastState,
  ToastType,
} from "@/components/dashboards/toast/Toast";

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
type ProfileValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(initialData);
  const supabase = createClient();

  const profileForm = useForm<ProfileValues>({
    defaultValues: initialData,
    mode: "onChange",
  });

  const showToast = (type: ToastType, title: string, description?: string) => {
    setToast({ type, title, description });
  };

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
      const emailChanged = data.email !== currentUserData.email;
      const nameChanged =
        data.firstName !== currentUserData.firstName ||
        data.lastName !== currentUserData.lastName;

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
        setCurrentUserData((prev) => ({
          ...prev,
          firstName: data.firstName,
          lastName: data.lastName,
        }));
      }

      // Handle email change (requires verification)
      if (emailChanged) {
        console.log(
          "Updating email from",
          currentUserData.email,
          "to",
          data.email,
        );

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
        setTimeout(() => redirect("/login"), 2000);
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

  return (
    <>
      <ToastBanner toast={toast} onClose={() => setToast(null)} />

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
          For security reasons, email changes require verification. You&apos;ll
          receive an email at your new address with a verification link. Your
          login email won&apos;t change until you verify the new address.
        </AlertDescription>
      </Alert>
    </>
  );
}
