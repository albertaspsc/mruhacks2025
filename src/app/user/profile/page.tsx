import { redirect } from "next/navigation";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { getRegistration } from "@/db/registration";
import ProfileForm from "../../../components/dashboards/ProfileForm";
import { use } from "react";

export default function ProfilePage() {
  const { data: registration, error } = use(getRegistration());

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container max-w-2xl py-10">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Unable to load your profile. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!registration) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-2xl py-10">
        <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
        <p className="text-gray-500 mb-6">Manage your personal information</p>

        <ProfileForm
          initialData={{
            firstName: registration.firstName || "",
            lastName: registration.lastName || "",
            email: registration.email || "",
          }}
        />
      </div>
    </div>
  );
}
