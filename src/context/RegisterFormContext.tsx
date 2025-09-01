"use client";
import { createSelectSchema } from "drizzle-zod";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { parkingSituation, yearOfStudy } from "./../db/schema";
import { z } from "zod";
import { useRouter, usePathname } from "next/navigation";

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
  resume: z.string().optional(),
});

export type RegistrationInput = z.infer<typeof RegistrationSchema>;

// Local storage key for form data
const FORM_DATA_KEY = "mruhacks_registration_form_data";

// Helper functions for local storage
const saveToLocalStorage = (data: Partial<RegistrationInput>) => {
  try {
    localStorage.setItem(FORM_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("Failed to save form data to localStorage:", error);
  }
};

const loadFromLocalStorage = (): Partial<RegistrationInput> => {
  try {
    const saved = localStorage.getItem(FORM_DATA_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.warn("Failed to load form data from localStorage:", error);
    return {};
  }
};

const clearLocalStorage = () => {
  try {
    localStorage.removeItem(FORM_DATA_KEY);
  } catch (error) {
    console.warn("Failed to clear form data from localStorage:", error);
  }
};

type ContextType = {
  data: Partial<RegistrationInput>;
  setValues: (vals: Partial<RegistrationInput>) => void;
  navigateToStep: (step: number) => void;
  goBack: () => void;
  goNext: () => void;
  currentStep: number;
  clearFormData: () => void;
};

const RegisterFormContext = createContext<ContextType>({
  data: {},
  setValues() {},
  navigateToStep() {},
  goBack() {},
  goNext() {},
  currentStep: 1,
  clearFormData() {},
});

export function RegisterFormProvider({ children }: React.PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<Partial<RegistrationInput>>({});
  const [currentStep, setCurrentStep] = useState(1);

  // Sync current step with pathname
  useEffect(() => {
    const path = pathname ?? "";
    let step = 1;
    if (path.includes("verify-2fa")) step = 2;
    else if (path.includes("step-1")) step = 3;
    else if (path.includes("step-2")) step = 4;
    else if (path.includes("complete")) step = 5;
    setCurrentStep(step);
  }, [pathname]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = loadFromLocalStorage();
    if (Object.keys(savedData).length > 0) {
      setData(savedData);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(data).length > 0) {
      saveToLocalStorage(data);
    }
  }, [data]);

  const setValues = useCallback((vals: Partial<RegistrationInput>) => {
    setData((prev) => {
      const newData = { ...prev, ...vals };
      return newData;
    });
  }, []);

  const navigateToStep = useCallback(
    (step: number) => {
      setCurrentStep(step);

      const stepRoutes = {
        1: "/register",
        2: "/register/verify-2fa",
        3: "/register/step-1",
        4: "/register/step-2",
        5: "/register/complete",
      };

      const route = stepRoutes[step as keyof typeof stepRoutes];
      if (route) {
        router.push(route);
      }
    },
    [router],
  );

  const goBack = useCallback(() => {
    // Determine previous step based on current location
    if (currentStep > 1) {
      navigateToStep(currentStep - 1);
    }
  }, [currentStep, navigateToStep]);

  const goNext = useCallback(() => {
    // Determine next step based on current location
    if (currentStep < 5) {
      navigateToStep(currentStep + 1);
    }
  }, [currentStep, navigateToStep]);

  const clearFormData = useCallback(() => {
    setData({});
    clearLocalStorage();
  }, []);

  return (
    <RegisterFormContext.Provider
      value={{
        data,
        setValues,
        navigateToStep,
        goBack,
        goNext,
        currentStep,
        clearFormData,
      }}
    >
      {children}
    </RegisterFormContext.Provider>
  );
}

export const useRegisterForm = () => useContext(RegisterFormContext);
