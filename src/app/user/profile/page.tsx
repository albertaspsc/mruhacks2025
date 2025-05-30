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
import { Loader2, Save } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

// Mocked toast function
const toast = ({
  title,
  description,
  variant = "default",
}: {
  title: string;
  description: string;
  variant?: string;
}) => {
  console.log(`Toast: ${title} - ${description} (${variant})`);
  alert(`${title}: ${description}`);
};

// Basic profile form type
type ProfileValues = {
  firstName: string;
  lastName: string;
  email: string;
};

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  // Fetch mock user data
  useEffect(() => {
    // Simulate API delay
    const timeout = setTimeout(() => {
      const mockUser = {
        id: "asia123",
        email: "asia@mtroyal.ca",
        firstName: "Asia",
        lastName: "Hacker",
      };

      setUser(mockUser);

      // Set form values
      profileForm.reset({
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
      });

      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [profileForm]);

  // Handle profile form submission
  function onProfileSubmit(data: ProfileValues) {
    setIsSaving(true);
    setSaveSuccess(false);

    // Simulate API call to update profile
    setTimeout(() => {
      console.log("Profile data submitted:", data);
      setIsSaving(false);
      setSaveSuccess(true);

      // Clear success message after a delay
      setTimeout(() => setSaveSuccess(false), 3000);

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
        variant: "default",
      });
    }, 1000);
  }

  // Show loading state
  if (isLoading && !user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container max-w-2xl py-10">
      <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
      <p className="text-gray-500 mb-6">Manage your personal information</p>

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
          <CardDescription>Update your name and email address.</CardDescription>
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" type="email" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the email used for communication and login.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
