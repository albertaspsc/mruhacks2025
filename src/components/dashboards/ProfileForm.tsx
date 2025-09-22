"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2, Mail } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  updateUserEmailAction,
  updateUserProfileAction,
} from "@/actions/profile-actions";
import { ToastBanner } from "@/components/dashboards/toast/Toast";
import { ProfileUpdateSchema, FormOptions } from "@/types/registration";
import { PersonalDetailsSectionWithDefaults } from "@/components/forms/sections/PersonalDetailsSection";
import { PreferencesSection } from "@/components/forms/sections/PreferencesSection";
import { EventDetailsSectionWithDefaults } from "@/components/forms/sections/EventDetailsSection";
import { useFormState, useResumeUpload } from "@/hooks";
import { formOptionTransformers } from "@/utils/formDataTransformers";

type BaseRegistrationInput =
  import("@/types/registration").BaseRegistrationInput;
type ProfileUpdateInput = import("@/types/registration").ProfileUpdateInput;

interface ProfileFormProps {
  initialData: BaseRegistrationInput;
  formOptions: FormOptions;
}

export default function ProfileForm({
  initialData,
  formOptions,
}: ProfileFormProps) {
  const [emailVerificationSent, setEmailVerificationSent] =
    React.useState(false);
  const [currentUserData, setCurrentUserData] = React.useState({
    firstName: initialData.firstName,
    lastName: initialData.lastName,
    email: initialData.email,
  });

  const form = useForm<ProfileUpdateInput>({
    defaultValues: initialData,
    mode: "onChange",
  });

  const { isSubmitting, toast, showToast, clearToast } = useFormState();

  // Use the shared resume upload hook
  const {
    uploadFile: handleResumeUpload,
    isUploading: isResumeUploading,
    error: resumeUploadError,
  } = useResumeUpload({
    userId: initialData.email, // Using email as userId for profile updates
  });

  async function onSubmit(values: ProfileUpdateInput) {
    const validation = ProfileUpdateSchema.safeParse(values);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      showToast("error", "Validation Error", firstError.message);
      return;
    }

    setEmailVerificationSent(false);

    try {
      const emailChanged = values.email !== currentUserData.email;
      const nameChanged =
        values.firstName !== currentUserData.firstName ||
        values.lastName !== currentUserData.lastName;

      // Handle email change (requires verification) - use server action
      if (emailChanged) {
        console.log(
          "Updating email from",
          currentUserData.email,
          "to",
          values.email,
        );

        const emailResult = await updateUserEmailAction(values.email!);

        if (!emailResult.success) {
          showToast("error", "Email Update Failed", emailResult.error);
          return;
        }

        setEmailVerificationSent(true);
      }

      // Update registration data using bulk update (includes firstName and lastName)
      const result = await updateUserProfileAction({
        firstName: values.firstName,
        lastName: values.lastName,
        gender: values.gender,
        university: values.university,
        major: values.major,
        yearOfStudy: values.yearOfStudy,
        previousAttendance: values.previousAttendance,
        experience: values.experience,
        interests: values.interests,
        dietaryRestrictions: values.dietaryRestrictions,
        accommodations: values.accommodations,
        parking: values.parking,
        marketing: values.marketing,
        resume: values.resume,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to update registration data");
      }

      // Update local state for name changes
      if (nameChanged) {
        setCurrentUserData((prev) => ({
          ...prev,
          firstName: values.firstName!,
          lastName: values.lastName!,
        }));
      }

      // Show appropriate success message
      if (emailChanged && nameChanged) {
        showToast(
          "info",
          "Updates saved",
          `Profile and registration updated successfully. Please check ${values.email} for email verification.`,
        );
      } else if (emailChanged) {
        showToast(
          "info",
          "Verification email sent",
          `Profile updated successfully. Please check ${values.email} and click the verification link to confirm your new email address.`,
        );
      } else if (nameChanged) {
        showToast(
          "success",
          "Profile updated",
          "Your profile and registration information has been updated successfully.",
        );
      } else {
        showToast(
          "success",
          "Profile updated",
          "Your registration information has been updated successfully.",
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
    }
  }

  // Transform data for the shared components using utilities
  const transformedGenders = formOptionTransformers.genders(
    formOptions.genders,
  );
  const transformedUniversities = formOptionTransformers.universities(
    formOptions.universities,
  );
  const transformedMajors = formOptionTransformers.majors(formOptions.majors);
  const transformedInterests = formOptionTransformers.interests(
    formOptions.interests,
  );
  const transformedDietaryRestrictions =
    formOptionTransformers.dietaryRestrictions(formOptions.dietaryRestrictions);
  const transformedMarketingTypes = formOptionTransformers.marketingTypes(
    formOptions.marketingTypes,
  );

  return (
    <>
      <ToastBanner toast={toast} onClose={clearToast} />

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
          <CardTitle>Profile & Registration Information</CardTitle>
          <CardDescription>
            Update your personal details and registration information. Email
            changes require verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Profile Information */}
              <PersonalDetailsSectionWithDefaults
                control={form.control}
                genders={transformedGenders}
                universities={transformedUniversities}
                majors={transformedMajors}
                disabled={isSubmitting}
              />

              {/* Interests and Preferences */}
              <PreferencesSection
                control={form.control}
                interests={transformedInterests}
                dietaryRestrictions={transformedDietaryRestrictions}
                disabled={isSubmitting}
              />

              {/* Event Details */}
              <EventDetailsSectionWithDefaults
                control={form.control}
                marketingTypes={transformedMarketingTypes}
                onResumeUpload={handleResumeUpload}
                isResumeUploading={isResumeUploading}
                resumeUploadError={resumeUploadError || undefined}
                existingResumeUrl={form.getValues("resume")}
                disabled={isSubmitting}
              />

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? (
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
