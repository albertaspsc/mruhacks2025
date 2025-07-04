"use client";

import { useForm } from "react-hook-form";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Save, User } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { getRegistration, Registration } from "@/db/registration";
import { useToast } from "@/components/hooks/use-toast";
import { createClient } from "../../../../utils/supabase/client";
import { getProfile, updateProfile } from "@/db/profiles";

type User = Pick<Registration, "firstName" | "lastName" | "schoolEmail">;

// Basic profile form type
type ProfileValues = {
  firstName: string;
  lastName: string;
  schoolEmail: string;
};

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  // Profile form with validation
  const profileForm = useForm<ProfileValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      schoolEmail: "",
    },
  });

  // Fetches user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);

        // Get current user from Supabase auth
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
          console.error("Auth error:", authError);
          toast({
            title: "Error",
            description: "Unable to load user data. Please log in again.",
            variant: "destructive",
          });
          return;
        }

        // Get users profile from database
        const { data: profile, error: profileError } = await getProfile();

        if (profileError) {
          console.error("Profile error:", profileError);
          toast({
            title: "Error",
            description: "Unable to load profile data.",
            variant: "destructive",
          });
          return;
        }

        // Map database profile to component state
        const userData: User = {
          schoolEmail: profile?.email || authUser.email || "",
          firstName: profile?.firstName || "",
          lastName: profile?.lastName || "",
        };

        setUser(userData);

        // Set form values with real data
        profileForm.reset({
          firstName: userData.firstName,
          lastName: userData.lastName,
          schoolEmail: userData.schoolEmail,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Unable to load user data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [profileForm, supabase, toast]);

  // Handle profile form submission
  async function onProfileSubmit(data: ProfileValues) {
    if (!user) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Validate required fields
      if (!data.firstName.trim() || !data.lastName.trim()) {
        toast({
          title: "Validation Error",
          description: "First name and last name are required.",
          variant: "destructive",
        });
        return;
      }

      // Update profile in database
      const { error } = await updateProfile({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.schoolEmail.trim(),
      });

      if (error) {
        throw error;
      }

      // Update local state
      setUser((prev) =>
        prev
          ? {
              ...prev,
              firstName: data.firstName.trim(),
              lastName: data.lastName.trim(),
              schoolEmail: data.schoolEmail.trim(),
            }
          : null,
      );

      setSaveSuccess(true);

      // Clear success message after delay
      setTimeout(() => setSaveSuccess(false), 3000);

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  // Show loading state
  if (isLoading && !user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container max-w-2xl py-10">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-gray-500">Manage your personal information</p>
        </div>
      </div>

      {saveSuccess && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <Save className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Changes saved</AlertTitle>
          <AlertDescription className="text-green-700">
            Your profile has been updated successfully.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your name and contact information. Changes will be reflected
            across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit(onProfileSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={profileForm.control}
                  name="firstName"
                  rules={{
                    required: "First name is required",
                    minLength: {
                      value: 1,
                      message: "First name cannot be empty",
                    },
                    maxLength: {
                      value: 50,
                      message: "First name must be less than 50 characters",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        First Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your first name"
                          {...field}
                          disabled={isSaving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="lastName"
                  rules={{
                    required: "Last name is required",
                    minLength: {
                      value: 1,
                      message: "Last name cannot be empty",
                    },
                    maxLength: {
                      value: 50,
                      message: "Last name must be less than 50 characters",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Last Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your last name"
                          {...field}
                          disabled={isSaving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={profileForm.control}
                name="schoolEmail"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                    message: "Please enter a valid email address",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email Address <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email address"
                        type="email"
                        {...field}
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormDescription>
                      This email will be used for all communication and must be
                      valid.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-500">
                  <span className="text-red-500">*</span> Required fields
                </div>
                <Button
                  type="submit"
                  disabled={isSaving || !profileForm.formState.isDirty}
                  className="min-w-[120px]"
                >
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* User Info Summary */}
      {user && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Account Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium text-gray-500">
                Username:
              </span>
              <span className="text-sm">{user.schoolEmail}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium text-gray-500">
                Full Name:
              </span>
              <span className="text-sm">
                {user.firstName} {user.lastName}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-500">
                Contact Email:
              </span>
              <span className="text-sm">{user.schoolEmail}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
