// src/context/RegisterFormContext.tsx
"use client";
import React, { createContext, useContext, useState } from "react";

export type RegistrationData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  attendedBefore?: string;
  gender?: string;
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
  setValues: (vals: Partial<RegistrationData>) => void;
};

const RegisterFormContext = createContext<ContextType>({
  data: {},
  // no-op
  setValues() {},
});

export function RegisterFormProvider({ children }: React.PropsWithChildren) {
  const [data, setData] = useState<RegistrationData>({});

  const setValues = (vals: Partial<RegistrationData>) => {
    setData((prev) => ({ ...prev, ...vals }));
  };

  return (
    <RegisterFormContext.Provider value={{ data, setValues }}>
      {children}
    </RegisterFormContext.Provider>
  );
}

export const useRegisterForm = () => useContext(RegisterFormContext);
