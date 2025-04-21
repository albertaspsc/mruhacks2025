"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  useRegisterForm,
  RegistrationData,
} from "@/context/RegisterFormContext";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type FinalForm = Pick<
  RegistrationData,
  | "programmingExperience"
  | "interests"
  | "dietary"
  | "accommodations"
  | "parking"
  | "heardFrom"
>;

export default function Step2Page() {
  const router = useRouter();
  const { data, setValues } = useRegisterForm();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FinalForm>({ defaultValues: { interests: [], dietary: [] } });
  const interests = watch("interests") || [];

  const onSubmit: SubmitHandler<FinalForm> = (partial) => {
    setValues(partial);
    const full = { ...data, ...partial };
    console.groupCollapsed("📝 Registration Complete Payload");
    console.table(
      Object.fromEntries(
        Object.entries(full).map(([k, v]) => [
          k,
          Array.isArray(v) ? v.join(", ") : v,
        ]),
      ),
    );
    console.log("Full JSON:", full);
    console.groupEnd();
    router.push("/register/complete");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h1 className="text-2xl font-semibold">Final Questions</h1>

      <div>
        <Label htmlFor="programmingExperience">Programming Experience</Label>
        <select
          id="programmingExperience"
          {...register("programmingExperience", { required: true })}
          className="w-full border rounded px-3 py-2 truncate"
          title={watch("programmingExperience")}
        >
          <option>Beginner – What is a computer?</option>
          <option>
            Intermediate – My spaghetti code is made out of tagliatelle.
          </option>
          <option>Advanced – Firewalls disabled, mainframes bypassed.</option>
          <option>Expert – I know what a computer is.</option>
        </select>
      </div>

      <div>
        <Label htmlFor="interests">Interests (max 3)</Label>
        <select
          id="interests"
          {...register("interests", { validate: (v) => v.length <= 3 })}
          multiple
          size={5}
          className="w-full border rounded px-3 py-2"
        >
          <option>Mobile App Development</option>
          <option>Web Development</option>
          <option>Data Science and ML</option>
          <option>Design and User Experience (UX/UI)</option>
          <option>Game Development</option>
        </select>
        {errors.interests && <p className="text-red-600">Select up to 3</p>}
      </div>

      <div>
        <Label htmlFor="dietary">Dietary Restrictions</Label>
        <select
          id="dietary"
          {...register("dietary")}
          multiple
          size={7}
          className="w-full border rounded px-3 py-2"
        >
          <option>Kosher</option>
          <option>Vegetarian</option>
          <option>Vegan</option>
          <option>Halal</option>
          <option>Gluten‑free</option>
          <option>Peanuts & Treenuts allergy</option>
          <option>None</option>
        </select>
      </div>

      <div>
        <Label htmlFor="accommodations">Special Accommodations</Label>
        <textarea
          id="accommodations"
          {...register("accommodations")}
          placeholder="If yes, please specify…"
          className="w-full border rounded px-3 py-2 h-24"
        />
      </div>

      <div>
        <Label htmlFor="parking">Will you require parking?</Label>
        <select
          id="parking"
          {...register("parking", { required: true })}
          className="w-full border rounded px-3 py-2"
        >
          <option>Yes</option>
          <option>No</option>
          <option>Not sure yet</option>
        </select>
      </div>

      <div>
        <Label htmlFor="heardFrom">How did you hear about us?</Label>
        <select
          id="heardFrom"
          {...register("heardFrom", { required: true })}
          className="w-full border rounded px-3 py-2"
        >
          <option>Poster</option>
          <option>Social Media</option>
          <option>Word of Mouth</option>
          <option>Website / Googling it</option>
          <option>Attended the event before</option>
          <option>Other…</option>
        </select>
      </div>

      <Button type="submit" className="w-full">
        Submit
      </Button>
    </form>
  );
}
