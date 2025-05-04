"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  useRegisterForm,
  RegistrationData,
} from "@/context/RegisterFormContext";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

type FinalForm = Pick<
  RegistrationData,
  | "programmingExperience"
  | "interests"
  | "dietary"
  | "accommodations"
  | "parking"
  | "heardFrom"
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
  } = useForm<FinalForm>({ defaultValues: { interests: [], dietary: [] } });

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
    router.push(
      `/register/verify-2fa?email=${encodeURIComponent(full.email ?? "")}`,
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h1 className="text-2xl font-semibold">Final Questions</h1>

      {/* Programming Experience */}
      <div>
        <Label htmlFor="programmingExperience">
          Programming Experience <span className="text-red-500">*</span>
        </Label>
        <select
          id="programmingExperience"
          {...register("programmingExperience", { required: "Required" })}
          className="w-full border rounded px-3 py-2"
        >
          <option>Beginner – What is a computer?</option>
          <option>
            Intermediate – My spaghetti code is made out of tagliatelle.
          </option>
          <option>Advanced – Firewalls disabled, mainframes bypassed.</option>
          <option>Expert – I know what a computer is.</option>
        </select>
        {errors.programmingExperience && (
          <p className="mt-1 text-sm text-red-600">
            {errors.programmingExperience.message}
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
              validate: (v) => v.length <= 3 || "Select at most 3",
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
        <Label htmlFor="dietary">Dietary Restrictions</Label>
        {/* desktop */}
        <div className="hidden sm:block">
          <select
            id="dietary"
            {...register("dietary")}
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
                {...register("dietary")}
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
        <Label htmlFor="heardFrom">
          How did you hear about us? <span className="text-red-500">*</span>
        </Label>
        <select
          id="heardFrom"
          {...register("heardFrom", { required: "Required" })}
          className="w-full border rounded px-3 py-2"
        >
          <option>Poster</option>
          <option>Social Media</option>
          <option>Word of Mouth</option>
          <option>Website / Googling it</option>
          <option>Attended the event before</option>
          <option>Other…</option>
        </select>
        {errors.heardFrom && (
          <p className="mt-1 text-sm text-red-600">
            {errors.heardFrom.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full">
        Submit &amp; Verify 2FA
      </Button>
    </form>
  );
}
