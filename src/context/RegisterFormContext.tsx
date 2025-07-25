// src/context/RegisterFormContext.tsx
"use client";
import { createSelectSchema } from "drizzle-zod";
import React, { createContext, useContext, useState } from "react";
import { parkingSituation, yearOfStudy } from "./../db/schema";
import { z } from "zod";

// export type RegistrationData = {
//   firstName?: string;
//   lastName?: string;
//   email?: string;
//   password?: string;
//   attendedBefore?: string;
//   gender?: string;
//   institution?: string;
//   major?: string;
//   year?: string;
//   programmingExperience?: string;
//   interests?: string[];
//   dietary?: string[];
//   accommodations?: string;
//   parking?: string;
//   heardFrom?: string;
// };

export const RegistrationSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  gender: z.string(),
  university: z.string(),
  previousAttendance: z.coerce.boolean(),
  major: z.string(),
  parking: createSelectSchema(parkingSituation),
  email: z.string().email(),
  yearOfStudy: createSelectSchema(yearOfStudy),
  experience: z.string(),
  accommodations: z.string(),
  dietaryRestrictions: z.array(z.string()),
  interests: z.array(z.string()),
  marketing: z.string().min(1),
  resume: z.instanceof(File).optional(),
});

export type RegistrationInput = z.infer<typeof RegistrationSchema>;

type ContextType = {
  data: Partial<RegistrationInput>;
  setValues: (vals: Partial<RegistrationInput>) => void;
};

const RegisterFormContext = createContext<ContextType>({
  data: {},
  // no-op
  setValues() {},
});

export function RegisterFormProvider({ children }: React.PropsWithChildren) {
  const [data, setData] = useState<Partial<RegistrationInput>>({});

  const setValues = (vals: Partial<RegistrationInput>) => {
    setData((prev) => ({ ...prev, ...vals }));
  };

  return (
    <RegisterFormContext.Provider value={{ data, setValues }}>
      {children}
    </RegisterFormContext.Provider>
  );
}

export const useRegisterForm = () => useContext(RegisterFormContext);
