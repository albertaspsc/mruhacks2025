"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type RegistrationData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  attendedBefore?: "yes" | "no";
  gender?: "male" | "female" | "other" | "preferNot";
  institution?: string;
  major?: string;
  year?: string;
  programmingExperience?: string;
  interests?: string[];
  dietary?: string[];
  accommodations?: string;
  parking?: string;
  heardFrom?: string;
};

type ContextType = {
  data: RegistrationData;
  setValues: (partial: Partial<RegistrationData>) => void;
};

const RegisterFormContext = createContext<ContextType>({
  data: {},
  setValues: () => {},
});

export function RegisterFormProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<RegistrationData>({});
  const setValues = (partial: Partial<RegistrationData>) =>
    setData((prev) => ({ ...prev, ...partial }));
  return (
    <RegisterFormContext.Provider value={{ data, setValues }}>
      {children}
    </RegisterFormContext.Provider>
  );
}

export function useRegisterForm() {
  return useContext(RegisterFormContext);
}
