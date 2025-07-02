"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  useRegisterForm,
  RegistrationInput,
} from "@/context/RegisterFormContext";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { getStaticOptions } from "src/db/registration";

type FinalForm = Pick<
  RegistrationInput,
  | "experience"
  | "interests"
  | "dietaryRestrictions"
  | "accommodations"
  | "parking"
  | "marketing"
>;

const INTEREST_OPTIONS = [
  "Mobile App Development",
  "Web Development",
  "Data Science and ML",
  "Design and User Experience (UX/UI)",
  "Game Development",
];

const DIETARY_OPTIONS = [
  "Kosher",
  "Vegetarian",
  "Vegan",
  "Halal",
  "Gluten-free",
  "Peanuts & Treenuts allergy",
  "None",
];

const MARKETING_OPTIONS = [
  "Poster",
  "Social Media",
  "Word of Mouth",
  "Website / Googling it",
  "Attended the event before",
  "Other…",
];

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

  // A database call is not always the fastest, thus const defaults
  const [dietaryOptions, setDietaryOptions] =
    useState<string[]>(DIETARY_OPTIONS);
  const [interestOptions, setInterestOptions] =
    useState<string[]>(INTEREST_OPTIONS);
  const [marketingOptions, setMarketingOptions] =
    useState<string[]>(MARKETING_OPTIONS);

  useEffect(() => {
    // The defaults may not accurately repersent whats actually in the database, hence the database call
    const loadStaticOptions = async () => {
      const { dietaryRestrictions, interests, marketingTypes } =
        await getStaticOptions();
      setDietaryOptions(dietaryRestrictions);
      setInterestOptions(interests);
      setMarketingOptions(marketingTypes);
    };
    loadStaticOptions();
  }, []);

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
          <option value="Beginner">Beginner – What is a computer?</option>
          <option value="Intermediate">
            Intermediate – My spaghetti code is made out of tagliatelle.
          </option>
          <option value="Advanced">
            Advanced – Firewalls disabled, mainframes bypassed.
          </option>
          <option value="Expert">Expert – I know what a computer is.</option>
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
            {interestOptions.map((opt) => (
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
          {interestOptions.map((opt) => (
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
            {dietaryOptions.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Hold Ctrl (or ⌘) to select multiple
          </p>
        </div>
        {/* mobile */}
        <div className="grid grid-cols-2 gap-2 sm:hidden">
          {dietaryOptions.map((opt) => (
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
          {marketingOptions.map((x, i) => (
            <option key={`marketingOption-${i}`}>{x}</option>
          ))}
        </select>
        {errors.marketing && (
          <p className="mt-1 text-sm text-red-600">
            {errors.marketing.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full">
        Submit
      </Button>
    </form>
  );
}
