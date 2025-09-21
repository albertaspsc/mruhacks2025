"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { bulkUpdateProfileAction } from "@/actions/profile-actions";

type ParkingState = import("@/types/registration").ParkingState;
type YearOfStudy = import("@/types/registration").YearOfStudy;

type RegistrationEditValues = {
  firstName: string;
  lastName: string;
  gender: number;
  university: number;
  major: number;
  yearOfStudy: YearOfStudy;
  previousAttendance: boolean;
  experience: number;
  interests: number[];
  dietaryRestrictions: number[];
  accommodations: string;
  parking: ParkingState;
  marketing: number;
  resume: string;
};

type FormOptions = {
  genders: { id: number; gender: string }[];
  universities: { id: number; uni: string }[];
  majors: { id: number; major: string }[];
  interests: { id: number; interest: string }[];
  dietaryRestrictions: { id: number; restriction: string }[];
  marketingTypes: { id: number; marketing: string }[];
};

interface Props {
  initial: RegistrationEditValues;
  options: FormOptions;
}

export default function RegistrationEditForm({ initial, options }: Props) {
  const form = useForm<RegistrationEditValues>({
    defaultValues: initial,
    mode: "onChange",
  });

  const [isSaving, setIsSaving] = React.useState(false);
  const [resumeUploading, setResumeUploading] = React.useState(false);
  const [resumeUploadError, setResumeUploadError] = React.useState("");

  async function uploadResume(file: File): Promise<string | null> {
    try {
      setResumeUploading(true);
      setResumeUploadError("");
      const fd = new FormData();
      fd.append("file", file);
      // userId is derived on the server route from auth when omitted; keep compatibility with current API
      const res = await fetch("/api/resume", { method: "POST", body: fd });
      if (!res.ok) {
        const text = await res.text();
        setResumeUploadError(text || "Upload failed");
        return null;
      }
      const { publicUrl } = (await res.json()) as { publicUrl: string };
      return publicUrl;
    } catch (e) {
      setResumeUploadError("Upload failed unexpectedly");
      return null;
    } finally {
      setResumeUploading(false);
    }
  }

  async function onSubmit(values: RegistrationEditValues) {
    setIsSaving(true);
    try {
      const result = await bulkUpdateProfileAction({
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
      if (!result.success) throw new Error(result.error || "Failed to update");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="First name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={(v) => field.onChange(parseInt(v))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white dark:bg-gray-800">
                    {options.genders.map((g) => (
                      <SelectItem key={g.id} value={String(g.id)}>
                        {g.gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="university"
            render={({ field }) => (
              <FormItem>
                <FormLabel>University</FormLabel>
                <Select
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={(v) => field.onChange(parseInt(v))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white dark:bg-gray-800">
                    {options.universities.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.uni}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="major"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Major</FormLabel>
                <Select
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={(v) => field.onChange(parseInt(v))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white dark:bg-gray-800">
                    {options.majors.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.major}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="yearOfStudy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year of Study</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white dark:bg-gray-800">
                    {(
                      ["1st", "2nd", "3rd", "4th+", "Recent Grad"] as const
                    ).map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="previousAttendance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Attended MRUHacks before?</FormLabel>
                <Select
                  value={field.value ? "true" : "false"}
                  onValueChange={(v) => field.onChange(v === "true")}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white dark:bg-gray-800">
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Programming Experience</FormLabel>
                <Select
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={(v) => field.onChange(parseInt(v))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white dark:bg-gray-800">
                    <SelectItem value="1">Beginner</SelectItem>
                    <SelectItem value="2">Intermediate</SelectItem>
                    <SelectItem value="3">Advanced</SelectItem>
                    <SelectItem value="4">Expert</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="interests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interests (max 3)</FormLabel>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {options.interests.map((interest) => {
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
                      <label
                        htmlFor={`interest-${interest.id}`}
                        className="text-sm"
                      >
                        {interest.interest}
                      </label>
                    </div>
                  );
                })}
              </div>
              <FormDescription>
                Select up to 3 interests ({field.value?.length ?? 0}/3 selected)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dietaryRestrictions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dietary Restrictions</FormLabel>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {options.dietaryRestrictions.map((restriction) => {
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
                      <label
                        htmlFor={`dietary-${restriction.id}`}
                        className="text-sm"
                      >
                        {restriction.restriction}
                      </label>
                    </div>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="parking"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Will you require parking?</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white dark:bg-gray-800">
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Not sure">Not sure</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="marketing"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How did you hear about us?</FormLabel>
                <Select
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={(v) => field.onChange(parseInt(v))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white dark:bg-gray-800">
                    {options.marketingTypes.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.marketing}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormLabel>Resume Upload (optional)</FormLabel>
          {resumeUploadError && (
            <div className="mb-2 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-600">
              {resumeUploadError}
            </div>
          )}
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = await uploadResume(file);
                if (url) form.setValue("resume", url, { shouldDirty: true });
              }}
              disabled={resumeUploading}
            />
            {resumeUploading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
          {form.getValues("resume") && (
            <p className="mt-2 text-xs text-muted-foreground break-all">
              Existing resume: {form.getValues("resume")}
            </p>
          )}
        </div>

        <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Registration
        </Button>
      </form>
    </Form>
  );
}
