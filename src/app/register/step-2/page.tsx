"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  useRegisterForm,
  RegistrationInput,
} from "@/context/RegisterFormContext";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import React, { useEffect, useState } from "react";

type FinalForm = Pick<
  RegistrationInput,
  | "experience"
  | "interests"
  | "dietaryRestrictions"
  | "accommodations"
  | "parking"
  | "marketing"
  | "resume"
>;

const INTEREST_OPTIONS = [
  "Mobile App Development",
  "Web Development",
  "Data Science and ML",
  "Design and User Experience (UX/UI)",
  "Game Development",
] as const;

const DIETARY_OPTIONS = [
  "Kosher",
  "Vegetarian",
  "Vegan",
  "Halal",
  "Gluten-free",
  "Peanuts & Treenuts allergy",
  "None",
] as const;

export default function Step2Page() {
  const router = useRouter();
  const { data, setValues } = useRegisterForm();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FinalForm>({
    defaultValues: { interests: [], dietaryRestrictions: [] },
  });

  const interests = watch("interests") || [];

  // enforce max 3 interests
  useEffect(() => {
    if (interests.length > 3) {
      setValue("interests", interests.slice(0, 3));
    }
  }, [interests, setValue]);

  const onSubmit: SubmitHandler<FinalForm> = (partial) => {
    setValues(partial);
    // build full payload
    const full = { ...data, ...partial };
    // always forward to 2fa with the saved email
    router.push(`/register/complete`);
  };

  const [files, setFiles] = useState<File[]>([]);

  // Validation functions
  const onFileValidate = (file: File) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return "File size must be less than 5MB";
    }
    return null;
  };

  const onFileReject = (file: File, message: string) => {
    console.error(`File rejected: ${file.name} - ${message}`);
  };

  const [acknowledgments, setAcknowledgments] = useState({
    informationUsage: false,
    sponsorSharing: false,
    mediaConsent: false,
  });

  // Acknowledgment validation function
  const allAcknowledgmentsChecked =
    Object.values(acknowledgments).every(Boolean);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h1 className="text-2xl font-semibold">Final Questions</h1>

      {/* Programming Experience */}
      <div>
        <Label htmlFor="experience">
          Programming Experience <span className="text-red-500">*</span>
        </Label>
        <select
          id="experience"
          {...register("experience", { required: "Required" })}
          className="w-full border rounded px-3 py-2"
        >
          <option>Beginner – What is a computer?</option>
          <option>
            Intermediate – My spaghetti code is made out of tagliatelle.
          </option>
          <option>Advanced – Firewalls disabled, mainframes bypassed.</option>
          <option>Expert – I know what a computer is.</option>
        </select>
        {errors.experience && (
          <p className="mt-1 text-sm text-red-600">
            {errors.experience.message}
          </p>
        )}
      </div>

      {/* Interests (max 3) */}
      <div>
        <Label htmlFor="interests">
          Interests (max 3) <span className="text-red-500">*</span>
        </Label>
        {/* desktop */}
        <div className="hidden sm:block">
          <select
            id="interests"
            {...register("interests", {
              validate: (v) => (v || []).length <= 3 || "Select at most 3",
            })}
            multiple
            size={5}
            className="w-full border rounded px-3 py-2"
          >
            {INTEREST_OPTIONS.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Hold Ctrl (or ⌘) to select multiple
          </p>
          {errors.interests && (
            <p className="mt-1 text-sm text-red-600">
              {errors.interests.message}
            </p>
          )}
        </div>
        {/* mobile */}
        <div className="grid grid-cols-2 gap-2 sm:hidden">
          {INTEREST_OPTIONS.map((opt) => (
            <label key={opt} className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                value={opt}
                {...register("interests")}
                disabled={!interests.includes(opt) && interests.length >= 3}
                className="border rounded"
              />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
          {errors.interests && (
            <p className="col-span-2 text-sm text-red-600">
              {errors.interests.message}
            </p>
          )}
        </div>
      </div>

      {/* Dietary Restrictions */}
      <div>
        <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
        {/* desktop */}
        <div className="hidden sm:block">
          <select
            id="dietaryRestrictions"
            {...register("dietaryRestrictions")}
            multiple
            size={7}
            className="w-full border rounded px-3 py-2"
          >
            {DIETARY_OPTIONS.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Hold Ctrl (or ⌘) to select multiple
          </p>
        </div>
        {/* mobile */}
        <div className="grid grid-cols-2 gap-2 sm:hidden">
          {DIETARY_OPTIONS.map((opt) => (
            <label key={opt} className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                value={opt}
                {...register("dietaryRestrictions")}
                className="border rounded"
              />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Accommodations */}
      <div>
        <Label htmlFor="accommodations">Special Accommodations</Label>
        <textarea
          id="accommodations"
          {...register("accommodations")}
          placeholder="If yes, please specify…"
          className="w-full border rounded px-3 py-2 h-24"
        />
      </div>

      {/* Parking */}
      <div>
        <Label htmlFor="parking">
          Will you require parking? <span className="text-red-500">*</span>
        </Label>
        <select
          id="parking"
          {...register("parking", { required: "Required" })}
          className="w-full border rounded px-3 py-2"
        >
          <option>Yes</option>
          <option>No</option>
          <option>Not sure yet</option>
        </select>
        {errors.parking && (
          <p className="mt-1 text-sm text-red-600">{errors.parking.message}</p>
        )}
      </div>

      {/* Heard From */}
      <div>
        <Label htmlFor="marketing">
          How did you hear about us? <span className="text-red-500">*</span>
        </Label>
        <select
          id="marketing"
          {...register("marketing", { required: "Required" })}
          className="w-full border rounded px-3 py-2"
        >
          <option>Poster</option>
          <option>Social Media</option>
          <option>Word of Mouth</option>
          <option>Website / Googling it</option>
          <option>Attended the event before</option>
          <option>Other…</option>
        </select>
        {errors.marketing && (
          <p className="mt-1 text-sm text-red-600">
            {errors.marketing.message}
          </p>
        )}
      </div>

      {/* Resume */}
      <div>
        <div className="space-y-1">
          <Label htmlFor="resume" className="text-sm font-semibold">
            Resume Upload
            <span className="text-muted-foreground font-normal ml-2">
              (Optional but Recommended):
            </span>
          </Label>
          <p className="text-sm text-muted-foreground">
            Upload your resume to be considered for sponsor recruitment
            opportunities and internships.
          </p>
        </div>
        <FileUpload
          value={files}
          onValueChange={setFiles}
          onFileValidate={onFileValidate}
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
              <p className="font-medium text-sm">
                Drag & drop your resume here
              </p>
              <p className="text-muted-foreground text-xs">
                Or click to browse (PDF, DOC, DOCX only)
              </p>
            </div>
            <FileUploadTrigger asChild>
              <Button className="mt-2 w-fit">Browse files</Button>
            </FileUploadTrigger>
          </FileUploadDropzone>
          <FileUploadList>
            {files.map((file) => (
              <FileUploadItem key={file.name} value={file}>
                <FileUploadItemPreview />
                <FileUploadItemMetadata />
                <FileUploadItemDelete asChild>
                  <Button
                    variant="ghost"
                    className="size-7 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="size-4" />
                  </Button>
                </FileUploadItemDelete>
              </FileUploadItem>
            ))}
          </FileUploadList>
        </FileUpload>
      </div>

      {/* Acknowledgments */}
      <div className="space-y-6 mt-8">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Final Acknowledgments</h3>
          <p className="text-sm text-muted-foreground">
            Please review and accept the following before completing your
            registration:
          </p>
        </div>
      </div>
      {/* Permission to use information */}
      <div className="flex items-start space-x-3">
        <Checkbox
          id="informationUsage"
          checked={acknowledgments.informationUsage}
          onCheckedChange={(checked) =>
            setAcknowledgments((prev) => ({
              ...prev,
              informationUsage: checked as boolean,
            }))
          }
          required
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="informationUsage"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I give permission to MRUHacks to use my information for the purpose
            of the event
            <span className="text-red-500">*</span>
          </Label>
          <p className="text-xs text-muted-foreground">
            This includes event logistics, communication, and administration
            purposes.
          </p>
        </div>
      </div>

      {/* Permission to share with sponsors */}
      <div className="flex items-start space-x-3">
        <Checkbox
          id="sponsorSharing"
          checked={acknowledgments.sponsorSharing}
          onCheckedChange={(checked) =>
            setAcknowledgments((prev) => ({
              ...prev,
              sponsorSharing: checked as boolean,
            }))
          }
          required
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="sponsorSharing"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I give my permission to MRUHacks to share my information with our
            sponsors
            <span className="text-red-500">*</span>
          </Label>
          <p className="text-xs text-muted-foreground">
            Your information may be shared with event sponsors for recruitment
            and networking opportunities.
          </p>
        </div>
      </div>

      {/* Photo/Media consent - Professional version */}
      <div className="flex items-start space-x-3">
        <Checkbox
          id="mediaConsent"
          checked={acknowledgments.mediaConsent}
          onCheckedChange={(checked) =>
            setAcknowledgments((prev) => ({
              ...prev,
              mediaConsent: checked as boolean,
            }))
          }
          required
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="mediaConsent"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I consent to the use of my likeness in photographs, videos, and
            other media for promotional purposes
            <span className="text-red-500">*</span>
          </Label>
          <p className="text-xs text-muted-foreground">
            Media may be used for social media, marketing materials, and event
            documentation.
          </p>
        </div>
      </div>
      <Button
        type="submit"
        disabled={!allAcknowledgmentsChecked}
        className="w-full"
      >
        {allAcknowledgmentsChecked
          ? "Complete Registration"
          : "Please accept all acknowledgments"}
      </Button>
    </form>
  );
}
