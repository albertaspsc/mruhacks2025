// File: src/app/register/step-2/page.tsx
"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type FinalForm = {
  programmingExperience: string;
  interests: string[];
  dietary: string[];
  accommodations: string;
  parking: string;
  heardFrom: string;
};

export default function Step2Page() {
  const router = useRouter();
  const { register, handleSubmit, setValue } = useForm<FinalForm>();
  const [interestCount, setInterestCount] = useState(0);

  // Suggestions from spec
  const interestsList = [
    "Mobile App Development",
    "Web Development",
    "Data Science and ML",
    "Design and User Experience (UX/UI)",
    "Game Development",
    "Other…",
  ];

  const dietaryList = [
    "Kosher",
    "Vegetarian",
    "Vegan",
    "Halal",
    "Gluten‑free",
    "Peanuts & Treenuts allergy",
    "None",
    "Other…",
  ];

  const onSubmit: SubmitHandler<FinalForm> = (data) => {
    // TODO: send full data to your backend
    alert("Registered! 🎉");
    router.push("/register/complete");
  };

  // Enforce max 3 interests
  function handleInterestsChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    if (selected.length > 3) {
      // Undo last selection
      const last =
        e.target.selectedOptions[e.target.selectedOptions.length - 1];
      last.selected = false;
      return;
    }
    setInterestCount(selected.length);
    setValue("interests", selected);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      role="form"
      aria-labelledby="final-questions-heading"
    >
      {/* Accessible heading */}
      <h1 id="final-questions-heading" className="text-2xl font-semibold">
        Final Questions
      </h1>

      {/* Programming Experience with truncate + tooltip */}
      <div>
        <Label htmlFor="programmingExperience">Programming Experience</Label>
        <select
          id="programmingExperience"
          {...register("programmingExperience", { required: true })}
          className="w-full border border-gray-300 rounded px-3 py-2 truncate"
          title="Choose your level (hover to see full text)"
        >
          <option title="Beginner - What is a computer?">
            Beginner - What is a computer?
          </option>
          <option title="Intermediate - My spaghetti code is made out of tagliatelle.">
            Intermediate - My spaghetti code is made out of tagliatelle.
          </option>
          <option title="Advanced - Firewalls disabled, mainframes bypassed.">
            Advanced - Firewalls disabled, mainframes bypassed.
          </option>
          <option title="Expert - I know what a computer is.">
            Expert - I know what a computer is.
          </option>
        </select>
      </div>

      {/* Interests with max‑3 logic */}
      <div>
        <Label htmlFor="interests">
          Interests (select up to 3; selected {interestCount}/3)
        </Label>
        <select
          id="interests"
          multiple
          {...register("interests")}
          onChange={handleInterestsChange}
          className="w-full border border-gray-300 rounded px-3 py-2 h-28 overflow-auto"
        >
          {interestsList.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </div>

      {/* Dietary Restrictions */}
      <div>
        <Label htmlFor="dietary">Dietary Restrictions</Label>
        <select
          id="dietary"
          multiple
          {...register("dietary")}
          className="w-full border border-gray-300 rounded px-3 py-2 h-24 overflow-auto"
        >
          {dietaryList.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Special Accommodations */}
      <div>
        <Label htmlFor="accommodations">Special Accommodations</Label>
        <textarea
          id="accommodations"
          {...register("accommodations")}
          placeholder="If yes, please specify…"
          className="w-full border border-gray-300 rounded px-3 py-2 h-20"
        />
      </div>

      {/* Parking */}
      <div>
        <Label htmlFor="parking">Will you require parking?</Label>
        <select
          id="parking"
          {...register("parking", { required: true })}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option>Yes</option>
          <option>No</option>
          <option>Not sure yet</option>
        </select>
      </div>

      {/* How did you hear about us */}
      <div>
        <Label htmlFor="heardFrom">How did you hear about us?</Label>
        <select
          id="heardFrom"
          {...register("heardFrom", { required: true })}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option>Poster</option>
          <option>Social Media</option>
          <option>Word of Mouth</option>
          <option>Website/Google</option>
          <option>Attended Before</option>
          <option>Other…</option>
        </select>
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full">
        Submit
      </Button>
    </form>
  );
}
