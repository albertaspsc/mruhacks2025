"use client";

import { useForm } from "react-hook-form";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Loader2, AlertTriangle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface User {
  id: string;
  email: string;
  emailPreferences: {
    marketingEmails: boolean;
    eventUpdates: boolean;
    hackathonReminders: boolean;
  };
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

// Email preferences form type
type EmailPreferencesValues = {
  marketingEmails: boolean;
  eventUpdates: boolean;
  hackathonReminders: boolean;
};

// Password form type
type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Email preferences form
  const emailPreferencesForm = useForm<EmailPreferencesValues>({
    defaultValues: {
      marketingEmails: false,
      eventUpdates: true,
      hackathonReminders: true,
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Fetch mock user data
  useEffect(() => {
    // Simulate API delay
    const timeout = setTimeout(() => {
      const mockUser = {
        id: "asia123",
        email: "asia@mtroyal.ca",
        emailPreferences: {
          marketingEmails: false,
          eventUpdates: true,
          hackathonReminders: true,
        },
      };

      setUser(mockUser);

      // Email preference form values
      emailPreferencesForm.reset({
        marketingEmails: mockUser.emailPreferences.marketingEmails,
        eventUpdates: mockUser.emailPreferences.eventUpdates,
        hackathonReminders: mockUser.emailPreferences.hackathonReminders,
      });

      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [emailPreferencesForm]);

  // Handle email preferences form submission
  function onEmailPreferencesSubmit(data: EmailPreferencesValues) {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Email preferences submitted:", data);
      setIsLoading(false);
      toast({
        title: "Preferences updated",
        description: "Your email preferences have been updated successfully.",
        variant: "default",
      });
    }, 1000);
  }

  // Handle password form submission
  function onPasswordSubmit(data: PasswordFormValues) {
    setIsLoading(true);

    // Validate password match
    if (data.newPassword !== data.confirmPassword) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    // Simulate API call
    setTimeout(() => {
      console.log("Password data submitted:", data);
      setIsLoading(false);

      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
        variant: "default",
      });
    }, 1000);
  }

  // Handle profile deletion
  function handleDeleteProfile() {
    setIsDeleting(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Profile deleted");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      toast({
        title: "Profile deleted",
        description:
          "Your profile has been deleted successfully. You will be redirected to the home page.",
        variant: "default",
      });

      // Redirect would happen here in a real implementation
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }, 1500);
  }

  // Show loading state
  if (isLoading && !user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="email">Email Preferences</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* Email Preferences Tab */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Preferences</CardTitle>
              <CardDescription>
                Control what types of emails you receive from us.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...emailPreferencesForm}>
                <form
                  onSubmit={emailPreferencesForm.handleSubmit(
                    onEmailPreferencesSubmit,
                  )}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <FormField
                      control={emailPreferencesForm.control}
                      name="marketingEmails"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Marketing Emails</FormLabel>
                            <FormDescription>
                              Receive emails about our organization, partners,
                              and other opportunities.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailPreferencesForm.control}
                      name="eventUpdates"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Event Updates</FormLabel>
                            <FormDescription>
                              Receive updates about MRUHacks and workshops.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Preferences
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password for enhanced security.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Current Password"
                            type="password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="New Password"
                            type="password"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Password must be at least 8 characters long.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Confirm New Password"
                            type="password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Change Password
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Delete Account</CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning: This action cannot be undone</AlertTitle>
                <AlertDescription>
                  Deleting your account will permanently remove all your data,
                  including your profile, registration information, and
                  hackathon history.
                </AlertDescription>
              </Alert>

              {showDeleteConfirm ? (
                <div className="border border-red-200 rounded-md p-6 bg-red-50">
                  <h3 className="text-lg font-medium text-red-800 mb-4">
                    Are you absolutely sure?
                  </h3>
                  <p className="text-red-700 mb-6">
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </p>
                  <div className="flex space-x-4">
                    <Button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleDeleteProfile} disabled={isDeleting}>
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Yes, Delete My Account"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setShowDeleteConfirm(true)}>
                  Delete Account
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
