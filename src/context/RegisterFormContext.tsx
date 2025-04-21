import React, { createContext, useContext, useState, ReactNode } from "react";

export type RegisterFormData = Partial<{
  // Account step
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;

  // Personal step
  attendedBefore: "yes" | "no";
  gender: "male" | "female" | "other" | "preferNot";
  institution: string;
  major: string;
  year: string;

  // Final step
  programmingExperience: string;
  interests: string[];
  dietary: string[];
  accommodations: string;
  parking: string;
  heardFrom: string;
}>;

export interface RegisterFormContextType {
  data: RegisterFormData;
  setFormValues: (values: Partial<RegisterFormData>) => void;
}

const RegisterFormContext = createContext<RegisterFormContextType>({
  data: {},
  setFormValues: () => {},
});

export function RegisterFormProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<RegisterFormData>({});

  const setFormValues = (values: Partial<RegisterFormData>) => {
    setData((prev) => ({ ...prev, ...values }));
  };

  return (
    <RegisterFormContext.Provider value={{ data, setFormValues }}>
      {children}
    </RegisterFormContext.Provider>
  );
}

export function useRegisterForm() {
  return useContext(RegisterFormContext);
}
