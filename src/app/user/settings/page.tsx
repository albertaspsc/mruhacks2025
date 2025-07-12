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
import { Loader2, AlertTriangle, Car, Info } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateParkingPreferences,
  updateMarketingPreferences,
  getParkingPreference,
} from "src/db/settings";
import { getRegistration, Registration } from "src/db/registration";
import { RegistrationInput } from "@context/RegisterFormContext";
import { createClient } from "utils/supabase/client";
import { redirect } from "next/navigation";

// interface User {
//   id: string;
//   email: string;
//   // emailPreferences: {
//   //   marketingEmails: boolean;
//   //   eventUpdates: boolean;
//   //   hackathonReminders: boolean;
//   // };
//   parking: "Yes" | "No" | "Not sure yet";
//   // licensePlate?: string;
// }

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

// Parking preferences form type
type ParkingPreferencesValues = {
  parkingPreference: "Yes" | "No" | "Not sure";
  licensePlate: string;
};

export default function SettingsPage() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<Registration>();
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

  // Parking preferences form
  const parkingPreferencesForm = useForm<ParkingPreferencesValues>({
    defaultValues: {
      parkingPreference: "Not sure",
      licensePlate: "",
    },
  });

  // Fetch mock user data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // shouldn't have error; see layout
      const { data: user } = await getRegistration();
      setUser(user);
      emailPreferencesForm.reset;
      const { data: parkingPreference } = await getParkingPreference();
      if (!parkingPreference) {
        parkingPreferencesForm.reset(parkingPreference);
      }
      setIsLoading(false);
    };
  }, [emailPreferencesForm, parkingPreferencesForm]);

  // Handle email preferences form submission
  async function onEmailPreferencesSubmit(data: EmailPreferencesValues) {
    setIsLoading(true);
    await updateMarketingPreferences(data.marketingEmails);
    setIsLoading(false);
    toast({
      title: "Preferences updated",
      description: "Your email preferences have been updated successfully.",
      variant: "default",
    });
  }

  // Handle parking preferences form submission
  async function onParkingPreferencesSubmit(data: ParkingPreferencesValues) {
    setIsLoading(true);
    await updateParkingPreferences(data);
    setIsLoading(false);

    toast({
      title: "Parking preferences updated",
      description: "Your parking preferences have been updated successfully.",
      variant: "default",
    });
  }

  // Handle password form submission
  async function onPasswordSubmit(data: PasswordFormValues) {
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
    supabase.auth.updateUser({ password: data.newPassword });
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
  }

  // Handle profile deletion
  async function handleDeleteProfile() {
    setIsDeleting(true);

    // Simulate API call
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
      redirect("/");
    }, 2000);
  }

  // Show loading state
  if (isLoading && !user) {
    return <LoadingSpinner />;
  }

  // Watch parking preference to conditionally show license plate field
  const parkingPreference = parkingPreferencesForm.watch("parkingPreference");

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="email">Email Preferences</TabsTrigger>
          <TabsTrigger value="parking">Parking</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* Email Preferences Tab */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mandatory Email Notice */}
              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertTitle>Notice</AlertTitle>
                <AlertDescription>
                  All confirmed participants will receive mandatory logistics
                  emails with essential event information and updates. These
                  emails cannot be opted out of to ensure you don&apos;t miss
                  critical details for your MRUHacks experience.
                </AlertDescription>
              </Alert>

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
                              Receive emails about our services, partners, and
                              other opportunities.
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

        {/* Parking Preferences Tab */}
        <TabsContent value="parking">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Parking Preferences
              </CardTitle>
              <CardDescription>
                Update your parking needs and license plate information for the
                event.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...parkingPreferencesForm}>
                <form
                  onSubmit={parkingPreferencesForm.handleSubmit(
                    onParkingPreferencesSubmit,
                  )}
                  className="space-y-6"
                >
                  <FormField
                    control={parkingPreferencesForm.control}
                    name="parkingPreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Will you require parking?</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your parking preference" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-gray-800">
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                            <SelectItem value="Not sure yet">
                              Not sure yet
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This helps us plan parking capacity for the event.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* License Plate Field - Only shows if parking is "Yes" */}
                  {parkingPreference === "Yes" && (
                    <FormField
                      control={parkingPreferencesForm.control}
                      name="licensePlate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Plate Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. ABC-123"
                              {...field}
                              className="uppercase"
                              onChange={(e) => {
                                // Convert to uppercase automatically
                                field.onChange(e.target.value.toUpperCase());
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter your vehicle&apos;s license plate number. This
                            will help with parking coordination and security.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Info Alert */}
                  <Alert>
                    <Car className="h-4 w-4" />
                    <AlertTitle>Parking Information</AlertTitle>
                    <AlertDescription>
                      {parkingPreference === "Yes" && (
                        <>
                          Parking will be available at Mount Royal University.
                          Please arrive early as spaces are limited.
                        </>
                      )}
                      {parkingPreference === "No" && (
                        <>
                          Consider carpooling or using public transportation.
                          The event location is accessible via Calgary Transit.
                        </>
                      )}
                      {parkingPreference === "Not sure" && (
                        <>
                          You can update this preference closer to the event
                          date. We recommend deciding at least 1 week before the
                          event.
                        </>
                      )}
                    </AlertDescription>
                  </Alert>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Parking Preferences
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
