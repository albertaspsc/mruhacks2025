"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type RegisterOptionsContextType = {
  majors: string[];
  universities: string[];
  dietaryRestrictions: string[];
  interests: string[];
  marketingTypes: string[];
  loading: boolean;
  error?: string;
  refresh: () => Promise<void>;
};

const RegisterOptionsContext = createContext<RegisterOptionsContextType>({
  majors: [],
  universities: [],
  dietaryRestrictions: [],
  interests: [],
  marketingTypes: [],
  loading: true,
  refresh: async () => {},
});

export function RegisterOptionsProvider({ children }: React.PropsWithChildren) {
  const supabase = createClient();
  const [majors, setMajors] = useState<string[]>([]);
  const [universities, setUniversities] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [marketingTypes, setMarketingTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const load = async () => {
    setLoading(true);
    try {
      const [
        majorsRes,
        universitiesRes,
        dietaryRes,
        interestsRes,
        marketingRes,
      ] = await Promise.all([
        supabase.from("majors").select("major").order("major"),
        supabase.from("universities").select("uni").order("uni"),
        supabase
          .from("dietary_restrictions")
          .select("restriction")
          .order("restriction"),
        supabase.from("interests").select("interest").order("interest"),
        supabase.from("marketing_types").select("marketing").order("marketing"),
      ]);

      if (!majorsRes.error && majorsRes.data) {
        setMajors(majorsRes.data.map((r: { major: string }) => r.major));
      } else {
        setMajors([]);
      }

      if (!universitiesRes.error && universitiesRes.data) {
        setUniversities(
          universitiesRes.data.map((r: { uni: string }) => r.uni),
        );
      } else {
        setUniversities([]);
      }

      if (!dietaryRes.error && dietaryRes.data) {
        setDietaryRestrictions(
          dietaryRes.data.map((r: { restriction: string }) => r.restriction),
        );
      } else {
        setDietaryRestrictions([]);
      }

      if (!interestsRes.error && interestsRes.data) {
        setInterests(
          interestsRes.data.map((r: { interest: string }) => r.interest),
        );
      } else {
        setInterests([]);
      }

      if (!marketingRes.error && marketingRes.data) {
        setMarketingTypes(
          marketingRes.data.map((r: { marketing: string }) => r.marketing),
        );
      } else {
        setMarketingTypes([]);
      }

      setError(undefined);
    } catch (e) {
      setError("Failed to load registration options");
      setMajors([]);
      setUniversities([]);
      setDietaryRestrictions([]);
      setInterests([]);
      setMarketingTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RegisterOptionsContext.Provider
      value={{
        majors,
        universities,
        dietaryRestrictions,
        interests,
        marketingTypes,
        loading,
        error,
        refresh: load,
      }}
    >
      {children}
    </RegisterOptionsContext.Provider>
  );
}

export const useRegisterOptions = () => useContext(RegisterOptionsContext);
