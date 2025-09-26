import { createClient } from "@/utils/supabase/server";
import { getUserProfileAction } from "@/actions/profileActions";
import { getFormOptionsAction } from "@/actions/registrationActions";
import ProfileForm from "@/components/dashboards/ProfileForm";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();

  // Get current user
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) {
    redirect("/login");
  }

  // Get user profile data first (critical for page load)
  const profileResult = await getUserProfileAction();

  if (!profileResult.success) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Profile
          </h1>
          <p className="text-gray-600">{profileResult.error}</p>
        </div>
      </div>
    );
  }

  // Get form options after profile data (less critical, can be loaded separately)
  // Use a timeout to prevent hanging on form options
  const formOptionsPromise = getFormOptionsAction();
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Form options timeout")), 8000),
  );

  let formOptionsResult: Awaited<ReturnType<typeof getFormOptionsAction>>;
  try {
    formOptionsResult = await Promise.race([
      formOptionsPromise,
      timeoutPromise,
    ]);
  } catch (error) {
    // If form options fail, we can still show the profile with a fallback
    console.warn("Form options failed to load:", error);
    formOptionsResult = {
      success: false,
      error: "Form options temporarily unavailable",
    };
  }

  if (!formOptionsResult.success) {
    // Show profile with limited functionality instead of complete failure
    const { user, interests, dietaryRestrictions } = profileResult.data!;

    // Transform data for the form with empty form options
    const initialData = {
      firstName: user.f_name,
      lastName: user.l_name,
      email: user.email,
      gender: user.gender,
      university: user.university,
      major: user.major,
      yearOfStudy: user.yearOfStudy,
      experience: user.experience,
      marketing: user.marketing,
      previousAttendance: user.prev_attendance,
      parking: user.parking,
      accommodations: user.accommodations,
      interests: interests.map((i: any) => i.id),
      dietaryRestrictions: dietaryRestrictions.map((d: any) => d.id),
      resume: user.resume_url || "",
    };

    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-gray-600 mt-2">
              Manage your account and registration details.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
              <p className="text-yellow-800 text-sm">
                ⚠️ Some form options are temporarily unavailable. You can still
                view and edit basic profile information.
              </p>
            </div>
          </div>

          <ProfileForm initialData={initialData} formOptions={null as any} />
        </div>
      </div>
    );
  }

  const { user, interests, dietaryRestrictions } = profileResult.data!;
  const formOptions = formOptionsResult.data!;

  // Transform data for the form
  const initialData = {
    firstName: user.f_name,
    lastName: user.l_name,
    email: user.email,
    gender: user.gender,
    university: user.university,
    major: user.major,
    yearOfStudy: user.yearOfStudy,
    experience: user.experience,
    marketing: user.marketing,
    previousAttendance: user.prev_attendance,
    parking: user.parking,
    accommodations: user.accommodations,
    interests: interests.map((i: any) => i.id),
    dietaryRestrictions: dietaryRestrictions.map((d: any) => d.id),
    resume: user.resume_url || "",
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your account and registration details.
          </p>
        </div>

        <ProfileForm initialData={initialData} formOptions={formOptions} />
      </div>
    </div>
  );
}
