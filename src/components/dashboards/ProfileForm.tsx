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
import { Loader2 } from "lucide-react";
import { updateUserProfileAction } from "@/actions/profile-actions";
import { ToastBanner } from "@/components/dashboards/toast/Toast";
import { ProfileUpdateSchema, FormOptions } from "@/types/registration";
import { PersonalDetailsSectionWithDefaults } from "@/components/forms/sections/PersonalDetailsSection";
import { PreferencesSection } from "@/components/forms/sections/PreferencesSection";
import { EventDetailsSectionWithDefaults } from "@/components/forms/sections/EventDetailsSection";
import { useFormState, useResumeUpload } from "@/hooks";
import {
  formOptionTransformers,
  mergeFormData,
  commonFieldMappings,
} from "@/utils/formDataTransformers";

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
  const [currentUserData, setCurrentUserData] = React.useState({
    firstName: initialData.firstName,
    lastName: initialData.lastName,
    email: initialData.email,
  });

  // Use mergeFormData for consistent form data handling, even with just initial data
  // This ensures proper field mapping and fallback values are applied
  const formDefaults = mergeFormData<ProfileUpdateInput>(
    {}, // No context data for profile form
    initialData,
    commonFieldMappings,
  );

  const form = useForm<ProfileUpdateInput>({
    defaultValues: formDefaults,
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

    try {
      const nameChanged =
        values.firstName !== currentUserData.firstName ||
        values.lastName !== currentUserData.lastName;

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
      if (nameChanged) {
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
        error.message ||
          "Failed to update your profile. Please try again. If the problem persists, please contact us.",
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
      <Card>
        <CardHeader>
          <CardTitle>Registration Information</CardTitle>
          <CardDescription>
            Update your registration information.
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
    </>
  );
}
