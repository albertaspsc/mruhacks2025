import { createClient } from "@/utils/supabase/server";
import { getFormOptionsAction } from "@/actions/registrationActions";
import PersonalDetailsForm from "./PersonalDetailsForm";

export default async function Step1Page() {
  const supabase = await createClient();

  // 1) Auth (SSR)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Keep it simple—render a server fallback. You can style with shadcn if you prefer.
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-semibold">Please sign in to continue</h1>
          <p className="text-muted-foreground">Your session was not found.</p>
        </div>
      </div>
    );
  }

  // 2) Data fetching (SSR) using the service
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
  const genders = formOptions.genders;
  const majors = formOptions.majors;
  const universities = formOptions.universities;

  // 3) Prefill from Google metadata if available
  const googleFirstName =
    (user.user_metadata?.given_name as string) ||
    (user.user_metadata?.first_name as string) ||
    "";
  const googleLastName =
    (user.user_metadata?.family_name as string) ||
    (user.user_metadata?.last_name as string) ||
    "";

  const initial = {
    email: user.email ?? "",
    firstName: googleFirstName,
    lastName: googleLastName,
  };

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="mb-6 text-2xl font-semibold">Personal Details</h1>
      <PersonalDetailsForm
        initial={initial}
        genders={genders}
        majors={majors}
        universities={universities}
      />
    </div>
  );
}
