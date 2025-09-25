"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PreferencesSection } from "@/components/forms/sections/PreferencesSection";
import { EventDetailsSectionWithDefaults } from "@/components/forms/sections/EventDetailsSection";
import { useResumeUpload, useFormState } from "@/components/hooks";
import { useRegisterForm } from "@/context/RegisterFormContext";
import { ToastBanner } from "@/components/dashboards/toast/Toast";
import {
  formOptionTransformers,
  mergeFormData,
  commonFieldMappings,
} from "@/utils/formDataTransformers";
import {
  FinalQuestionsSchema,
  FinalQuestionsInput,
  BaseRegistrationInput,
  ParkingState,
  InterestOption,
  DietaryRestrictionOption,
  MarketingTypeOption,
} from "@/types/registration";
import { registerUserAction } from "@/actions/registrationActions";

type Props = {
  /** Initial form values from server-side data */
  initial: {
    experience: number;
    parking?: ParkingState;
    marketing: number;
  };
  interests: InterestOption[];
  dietaryRestrictions: DietaryRestrictionOption[];
  marketingTypes: MarketingTypeOption[];
  userId: string;
};

type FinalForm = z.infer<typeof FinalQuestionsSchema>;

/**
 * Final questions form component for the registration process.
 *
 * This is the second step of the multi-step registration flow, where users provide
 * their preferences, event details, and acknowledgments. The form includes:
 * - Interest selection (required)
 * - Dietary restrictions (optional)
 * - Event preferences (parking, accommodations)
 * - Marketing information
 * - Resume upload (optional)
 * - Required acknowledgments
 *
 * @param props - Component props
 * @param props.initial - Initial form values from server-side data
 * @param props.interests - Available interest options for selection
 * @param props.dietaryRestrictions - Available dietary restriction options
 * @param props.marketingTypes - Available marketing type options
 * @param props.userId - User ID for file uploads and registration
 *
 * @returns JSX element representing the final questions form
 */
export default function FinalQuestionsForm({
  initial,
  interests,
  dietaryRestrictions,
  marketingTypes,
  userId,
}: Props) {
  const router = useRouter();
  const { data, setValues, goBack } = useRegisterForm();

  // Merge context data with initial data (context has priority)
  const defaults = mergeFormData<FinalForm>(data, initial, commonFieldMappings);

  const form = useForm<FinalForm>({
    resolver: zodResolver(FinalQuestionsSchema) as any,
    defaultValues: defaults,
    mode: "onBlur",
  });

  // File upload hook for resume handling
  const {
    uploadFile: handleResumeUpload,
    isUploading,
    error: uploadError,
    uploadedUrl,
    clearError: clearUploadError,
  } = useResumeUpload({ userId });

  // Form state management for loading states and error handling
  const { isSubmitting, showError, clearError, error, toast, clearToast } =
    useFormState();

  // Keep registration context in sync as user edits form fields
  React.useEffect(() => {
    const sub = form.watch((v) => {
      setValues({
        ...data,
        ...v,
      } as Partial<BaseRegistrationInput>);
    });
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch]);

  // Required acknowledgments state - all must be accepted to submit
  const [acks, setAcks] = React.useState({
    informationUsage: false,
    sponsorSharing: false,
    mediaConsent: false,
  });
  /** Whether all required acknowledgments have been accepted */
  const allAcks = Object.values(acks).every(Boolean);

  /**
   * Handles form submission for the final registration step.
   *
   * This function:
   * 1. Clears any existing errors
   * 2. Handles resume upload if a new file was uploaded
   * 3. Persists form data to the registration context
   * 4. Calls the server action to complete registration
   * 5. Redirects to dashboard on success or shows error on failure
   *
   * @param values - Form values from react-hook-form
   */
  async function onSubmit(values: FinalQuestionsInput) {
    // Clear any existing errors
    clearError();
    clearToast();

    try {
      // Upload resume if there's a new file
      let resumeUrl = values.resume ?? "";
      if (uploadedUrl) {
        resumeUrl = uploadedUrl;
      }

      // Persist into context
      setValues({
        ...data,
        ...values,
        resume: resumeUrl,
      } as Partial<BaseRegistrationInput>);

      // Invoke server action to complete registration
      const payload: Partial<BaseRegistrationInput> & { resume?: string } = {
        ...data,
        ...values,
        resume: resumeUrl,
      };

      const result = await registerUserAction(payload);

      if (!result.success) {
        const errorMessage =
          result.error || "Registration failed. Please try again.";
        showError(errorMessage);
        return;
      }

      // Success - redirect to dashboard
      router.push("/user/dashboard");
    } catch (e) {
      const errorMessage =
        e instanceof Error
          ? e.message
          : "Registration failed. Please try again.";
      showError(errorMessage);
    }
  }

  // Transform database data into UI component format (id + label structure)
  const transformedInterests = formOptionTransformers.interests(interests);
  const transformedDietaryRestrictions =
    formOptionTransformers.dietaryRestrictions(dietaryRestrictions);
  const transformedMarketingTypes =
    formOptionTransformers.marketingTypes(marketingTypes);

  return (
    <>
      {/* Toast notification for errors and success messages */}
      <ToastBanner toast={toast} onClose={clearToast} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Persistent error display */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Registration Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={clearError}
                      className="text-sm font-medium text-red-800 hover:text-red-600"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <PreferencesSection
            control={form.control}
            interests={transformedInterests}
            dietaryRestrictions={transformedDietaryRestrictions}
          />

          <EventDetailsSectionWithDefaults
            control={form.control}
            marketingTypes={transformedMarketingTypes}
            onResumeUpload={handleResumeUpload}
            isResumeUploading={isUploading}
            resumeUploadError={uploadError || undefined}
            existingResumeUrl={form.getValues("resume")}
            userId={userId}
          />

          {/* Acknowledgments */}
          <div className="mt-8 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Final Acknowledgments</h3>
              <p className="text-sm text-muted-foreground">
                Please review and accept the following before completing your
                registration:
              </p>
            </div>

            {[
              {
                key: "informationUsage",
                label:
                  "I give permission to MRUHacks to use my information for the purpose of the event",
                help: "This includes event logistics, communication, and administration purposes.",
              },
              {
                key: "sponsorSharing",
                label:
                  "I give my permission to MRUHacks to share my information with our sponsors",
                help: "Your information may be shared with event sponsors for recruitment and networking opportunities.",
              },
              {
                key: "mediaConsent",
                label:
                  "I consent to the use of my likeness in photographs, videos, and other media for promotional purposes",
                help: "Media may be used for social media, marketing materials, and event documentation.",
              },
            ].map((ack) => (
              <div key={ack.key} className="flex items-start space-x-3">
                <Checkbox
                  id={ack.key}
                  checked={acks[ack.key as keyof typeof acks]}
                  onCheckedChange={(v) =>
                    setAcks((prev) => ({ ...prev, [ack.key]: Boolean(v) }))
                  }
                  required
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor={ack.key} className="text-sm font-medium">
                    {ack.label} <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">{ack.help}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Nav Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                // Persist current values explicitly before going back
                const v = form.getValues();
                setValues({
                  ...data,
                  ...v,
                } as Partial<BaseRegistrationInput>);
                goBack();
              }}
              disabled={isUploading}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={
                !allAcks ||
                isUploading ||
                isSubmitting ||
                (form.getValues("interests")?.length ?? 0) === 0
              }
            >
              {isUploading
                ? "Uploading resume..."
                : isSubmitting
                  ? "Completing registration..."
                  : !allAcks
                    ? "Please accept all acknowledgments"
                    : (form.getValues("interests")?.length ?? 0) === 0
                      ? "Please select at least one interest"
                      : "Complete Registration"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
