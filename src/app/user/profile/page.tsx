import { createClient } from "@/utils/supabase/server";
import { getUserProfileAction } from "@/actions/profile-actions";
import { getFormOptionsAction } from "@/actions/registration-actions";
import CombinedProfileForm from "@/components/dashboards/CombinedProfileForm";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();

  // Get current user
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) {
    redirect("/login");
  }

  // Get user profile data and form options in parallel
  const [profileResult, formOptionsResult] = await Promise.all([
    getUserProfileAction(),
    getFormOptionsAction(),
  ]);

  if (!profileResult.success || !formOptionsResult.success) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Profile
          </h1>
          <p className="text-gray-600">
            {profileResult.error || formOptionsResult.error}
          </p>
        </div>
      </div>
    );
  }

  const { user, interests, dietaryRestrictions } = profileResult.data!;
  const formOptions = formOptionsResult.data!;

  // Transform data for the form - now using IDs directly
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

        <CombinedProfileForm
          initialData={initialData}
          formOptions={formOptions}
        />
      </div>
    </div>
  );
}
