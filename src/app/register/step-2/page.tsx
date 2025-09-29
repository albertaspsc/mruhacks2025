// app/register/step-2/page.tsx
import { createClient } from "@/utils/supabase/server";
import { getFormOptionsAction } from "@/actions/registrationActions";
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

  // Options (SSR) using the service
  const formOptionsResult = await getFormOptionsAction();

  if (!formOptionsResult.success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-semibold">Error Loading Form</h1>
          <p className="text-muted-foreground">{formOptionsResult.error}</p>
        </div>
      </div>
    );
  }

  const formOptions = formOptionsResult.data!;
  const interests = formOptions.interests;
  const dietaryRestrictions = formOptions.dietaryRestrictions;
  const marketingTypes = formOptions.marketingTypes;

  // Prefill minimal defaults (anything else comes from client context)
  const initial = {
    experience: 1, // Beginner
    parking: "Yes" as const,
    marketing: marketingTypes[0]?.id || 1,
  };

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="mb-6 text-2xl font-semibold">Final Questions</h1>
      <FinalQuestionsForm
        initial={initial}
        interests={interests}
        dietaryRestrictions={dietaryRestrictions}
        marketingTypes={marketingTypes}
        userId={user.id}
      />
    </div>
  );
}
