"use client";
import React, { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { BaseRegistrationInput } from "@/types/registration";

type ContextType = {
  data: Partial<BaseRegistrationInput>;
  setValues: (vals: Partial<BaseRegistrationInput>) => void;
  goBack: () => void;
  clearFormData: () => void;
};

const RegisterFormContext = createContext<ContextType>({
  data: {},
  // no-op
  setValues() {},
  goBack() {},
  clearFormData() {},
});

export function RegisterFormProvider({ children }: React.PropsWithChildren) {
  const [data, setData] = useState<Partial<BaseRegistrationInput>>({});
  const router = useRouter();

  const setValues = (vals: Partial<BaseRegistrationInput>) => {
    // Ensure boolean values are properly converted
    const processedVals = { ...vals };
    if (processedVals.previousAttendance !== undefined) {
      // Convert string "true"/"false" to boolean if needed
      if (typeof processedVals.previousAttendance === "string") {
        processedVals.previousAttendance =
          processedVals.previousAttendance === "true";
      }
    }
    setData((prev) => ({ ...prev, ...processedVals }));
  };

  const goBack = () => {
    router.back();
  };

  const clearFormData = () => {
    setData({});
  };

  return (
    <RegisterFormContext.Provider
      value={{ data, setValues, goBack, clearFormData }}
    >
      {children}
    </RegisterFormContext.Provider>
  );
}

export const useRegisterForm = () => useContext(RegisterFormContext);
