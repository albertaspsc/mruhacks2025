"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadTrigger,
  FileUploadList,
  FileUploadItem,
  FileUploadItemPreview,
  FileUploadItemMetadata,
  FileUploadItemDelete,
} from "@/components/ui/file-upload";
import { Upload, X } from "lucide-react";
import { useRegisterForm } from "@/context/RegisterFormContext";
import {
  FinalQuestionsSchema,
  FinalQuestionsInput,
  ParkingState,
} from "@/types/registration";
import { processCompleteRegistrationAction } from "@/actions/registration-actions";

type Props = {
  initial: {
    experience: number;
    parking?: ParkingState;
    marketing: number;
  };
  interests: { id: number; interest: string }[];
  dietaryRestrictions: { id: number; restriction: string }[];
  marketingTypes: { id: number; marketing: string }[];
  userId: string;
};

// Use shared schema with additional form-specific fields
const FinalFormSchema = FinalQuestionsSchema.extend({
  resume: z.string().default(""),
});

type FinalForm = z.infer<typeof FinalFormSchema>;

export default function FinalQuestionsForm({
  initial,
  interests,
  dietaryRestrictions,
  marketingTypes,
  userId,
}: Props) {
  const router = useRouter();
  const { data, setValues, goBack } = useRegisterForm();

  // RHF defaults: prefer context, fall back to SSR "initial"
  const form = useForm<FinalForm>({
    resolver: zodResolver(FinalFormSchema) as any,
    defaultValues: {
      experience: data.experience || initial.experience,
      interests: data.interests || [],
      dietaryRestrictions: data.dietaryRestrictions || [],
      accommodations: data.accommodations || "",
      parking: (data.parking as FinalForm["parking"]) || initial.parking,
      marketing: data.marketing || initial.marketing,
      resume: (typeof data.resume === "string" ? data.resume : "") || "",
    },
    mode: "onBlur",
  });

  // Local resume selection (File) and UX state
  const [resumeFile, setResumeFile] = React.useState<File | undefined>(
    undefined,
  );
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string>("");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string>("");

  // Keep context in sync as user edits (useful for multi-step back/forward)
  React.useEffect(() => {
    const sub = form.watch((v) => {
      setValues({
        ...data,
        ...v,
      } as any);
    });
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch]);

  // Acknowledgments (required to submit)
  const [acks, setAcks] = React.useState({
    informationUsage: false,
    sponsorSharing: false,
    mediaConsent: false,
  });
  const allAcks = Object.values(acks).every(Boolean);

  // File validation UX hooks for your FileUpload component
  const onFileValidate = (file: File) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) return "File size must be less than 5MB";
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type))
      return "Only PDF, DOC, and DOCX files are allowed";
    return null;
  };
  const onFileReject = (_file: File, message: string) =>
    setUploadError(message);

  // Server upload helper -> calls our route handler
  async function uploadResume(file: File): Promise<string | null> {
    try {
      setUploading(true);
      setUploadError("");
      const fd = new FormData();
      fd.append("file", file);
      fd.append("userId", userId);

      const res = await fetch("/api/resume", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const text = await res.text();
        setUploadError(text || "Upload failed");
        return null;
      }
      const { publicUrl } = (await res.json()) as { publicUrl: string };
      return publicUrl;
    } catch {
      setUploadError("Upload failed unexpectedly");
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values: any) {
    setSubmitError("");
    // Upload if a new file was selected
    let resumeUrl = values.resume ?? "";
    if (resumeFile) {
      const url = await uploadResume(resumeFile);
      if (!url) return; // abort on error
      resumeUrl = url;
    }

    // Persist into context
    setValues({
      ...data,
      ...values,
      resume: resumeUrl,
    });

    // Invoke server action to complete registration
    try {
      setSubmitting(true);
      const payload = {
        ...data,
        ...values,
        resume: resumeUrl,
      } as Record<string, unknown>;
      const serialized = JSON.parse(JSON.stringify(payload));
      const result = await processCompleteRegistrationAction(serialized);
      if (!result.success) {
        setSubmitError(
          result.error || "Registration failed. Please try again.",
        );
        return;
      }
      // Next page on success
      router.push("/user/dashboard");
    } catch (e) {
      setSubmitError(
        e instanceof Error
          ? e.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {submitError && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}
        {/* Experience */}
        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Programming Experience{" "}
                <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                value={field.value?.toString()}
                onValueChange={(value) => field.onChange(parseInt(value))}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">
                    Beginner – What is a computer?
                  </SelectItem>
                  <SelectItem value="2">
                    Intermediate – My spaghetti code is made out of tagliatelle.
                  </SelectItem>
                  <SelectItem value="3">
                    Advanced – Firewalls disabled, mainframes bypassed.
                  </SelectItem>
                  <SelectItem value="4">
                    Expert – I know what a computer is.
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Interests (max 3) */}
        <FormField
          control={form.control}
          name="interests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Interests (max 3) <span className="text-destructive">*</span>
              </FormLabel>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {interests.map((interest) => {
                  const checked = field.value?.includes(interest.id) ?? false;
                  const disableAdd =
                    !checked && (field.value?.length ?? 0) >= 3;
                  return (
                    <div
                      key={interest.id}
                      className="flex items-start space-x-3"
                    >
                      <Checkbox
                        id={`interest-${interest.id}`}
                        checked={checked}
                        disabled={disableAdd}
                        onCheckedChange={(v) => {
                          const isChecked = Boolean(v);
                          if (isChecked) {
                            if (
                              !field.value?.includes(interest.id) &&
                              (field.value?.length ?? 0) < 3
                            ) {
                              field.onChange([
                                ...(field.value ?? []),
                                interest.id,
                              ]);
                            }
                          } else {
                            field.onChange(
                              (field.value ?? []).filter(
                                (i: number) => i !== interest.id,
                              ),
                            );
                          }
                        }}
                      />
                      <Label
                        htmlFor={`interest-${interest.id}`}
                        className="text-sm"
                      >
                        {interest.interest}
                      </Label>
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Select up to 3 interests ({field.value?.length ?? 0}/3 selected)
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dietary Restrictions */}
        <FormField
          control={form.control}
          name="dietaryRestrictions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dietary Restrictions</FormLabel>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {dietaryRestrictions.map((restriction) => {
                  const checked =
                    field.value?.includes(restriction.id) ?? false;
                  return (
                    <div
                      key={restriction.id}
                      className="flex items-start space-x-3"
                    >
                      <Checkbox
                        id={`dietary-${restriction.id}`}
                        checked={checked}
                        onCheckedChange={(v) => {
                          const isChecked = Boolean(v);
                          if (isChecked) {
                            field.onChange([
                              ...(field.value ?? []),
                              restriction.id,
                            ]);
                          } else {
                            field.onChange(
                              (field.value ?? []).filter(
                                (r: number) => r !== restriction.id,
                              ),
                            );
                          }
                        }}
                      />
                      <Label
                        htmlFor={`dietary-${restriction.id}`}
                        className="text-sm"
                      >
                        {restriction.restriction}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </FormItem>
          )}
        />

        {/* Accommodations */}
        <FormField
          control={form.control}
          name="accommodations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Accommodations</FormLabel>
              <FormControl>
                <textarea
                  className="w-full rounded-md border px-3 py-2 h-24"
                  placeholder="If yes, please specify…"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Parking */}
        <FormField
          control={form.control}
          name="parking"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Will you require parking?{" "}
                <span className="text-destructive">*</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Not sure">Not sure</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Marketing / Heard From */}
        <FormField
          control={form.control}
          name="marketing"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                How did you hear about us?{" "}
                <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                value={field.value?.toString()}
                onValueChange={(value) => field.onChange(parseInt(value))}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a source" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {marketingTypes.map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.marketing}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Resume Upload */}
        <FormField
          control={form.control}
          name="resume" // stores the URL
          render={({ field }) => (
            <FormItem>
              <div className="space-y-1">
                <FormLabel className="text-sm font-semibold">
                  Resume Upload
                  <span className="ml-2 font-normal text-muted-foreground">
                    (Optional but Recommended)
                  </span>
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  Upload your resume to be considered for sponsor recruitment
                  opportunities and internships.
                </p>
              </div>

              {uploadError && (
                <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-600">{uploadError}</p>
                </div>
              )}

              <FileUpload
                value={resumeFile ? [resumeFile] : []}
                onValueChange={([file]) => {
                  setResumeFile(file);
                  setUploadError("");
                }}
                onFileValidate={(f) => onFileValidate(f)}
                onFileReject={onFileReject}
                accept=".pdf,.doc,.docx"
                maxFiles={1}
                className="w-full max-w-md"
              >
                <FileUploadDropzone>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center justify-center rounded-full border p-2.5">
                      <Upload className="size-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">
                      Drag & drop your resume here
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Or click to browse (PDF, DOC, DOCX only)
                    </p>
                  </div>
                  <FileUploadTrigger asChild>
                    <Button className="mt-2 w-fit" disabled={uploading}>
                      Browse files
                    </Button>
                  </FileUploadTrigger>
                </FileUploadDropzone>
                <FileUploadList>
                  {resumeFile && (
                    <FileUploadItem key={resumeFile.name} value={resumeFile}>
                      <FileUploadItemPreview />
                      <FileUploadItemMetadata />
                      <FileUploadItemDelete asChild>
                        <Button
                          variant="ghost"
                          className="size-7 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                          disabled={uploading}
                          onClick={() => setResumeFile(undefined)}
                        >
                          <X className="size-4" />
                        </Button>
                      </FileUploadItemDelete>
                    </FileUploadItem>
                  )}
                </FileUploadList>
              </FileUpload>

              {/* Show the resolved URL if already saved (i.e., returning to this step) */}
              {field.value && !resumeFile && (
                <p className="mt-2 text-xs text-muted-foreground break-all">
                  Existing resume on file: {field.value}
                </p>
              )}
            </FormItem>
          )}
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
              });
              goBack();
            }}
            disabled={uploading}
          >
            Back
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={
              !allAcks ||
              uploading ||
              (form.getValues("interests")?.length ?? 0) === 0
            }
          >
            {uploading
              ? "Uploading resume..."
              : !allAcks
                ? "Please accept all acknowledgments"
                : (form.getValues("interests")?.length ?? 0) === 0
                  ? "Please select at least one interest"
                  : "Complete Registration"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
