// app/register/step-2/page.tsx
import { createClient } from "@/utils/supabase/server";
import FinalQuestionsForm from "./FinalQuestionsForm";

export default async function Step2Page() {
  const supabase = await createClient();

  // Auth (SSR)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-semibold">Please sign in to continue</h1>
          <p className="text-muted-foreground">Your session was not found.</p>
        </div>
      </div>
    );
  }

  // Options (SSR) — adjust table/column names to your schema,
  // or replace with your existing server source for these lists.
  const [interestsRes, dietaryRes, marketingRes] = await Promise.all([
    supabase.from("interests").select("interest"),
    supabase.from("dietary_restrictions").select("restriction"),
    supabase.from("marketing_types").select("marketing"),
  ]);

  const interests = (interestsRes.data ?? []).map((x) => x.interest as string);
  const dietaryRestrictions = (dietaryRes.data ?? []).map(
    (x) => x.restriction as string,
  );
  const marketingTypes = (marketingRes.data ?? []).map(
    (x) => x.marketing as string,
  );

  // Prefill minimal defaults (anything else comes from client context)
  const initial = {
    experience: "Beginner" as const,
    parking: "Yes" as "Yes" | "No" | "Unsure",
    marketing: marketingTypes[0],
  };

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="mb-6 text-2xl font-semibold">Final Questions</h1>
      <FinalQuestionsForm
        initial={initial as any}
        interests={interests}
        dietaryRestrictions={dietaryRestrictions}
        marketingTypes={marketingTypes}
        userId={user.id}
      />
    </div>
  );
}
