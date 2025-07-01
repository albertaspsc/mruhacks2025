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
import { useToast } from "@/components/hooks/use-toast";
import { createClient } from "../../../../utils/supabase/client";
import { updateProfile, getProfile } from "../../../db/profiles";

interface User {
  id: string;
  email: string;
  emailPreferences: {
    marketingEmails: boolean;
  };
  parkingPreference: "Yes" | "No" | "Not sure";
  licensePlate?: string;
}

// Email preferences form type - only marketing emails can be changed
type EmailPreferencesValues = {
  marketingEmails: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  // Email preferences form
  const emailPreferencesForm = useForm<EmailPreferencesValues>({
    defaultValues: {
      marketingEmails: true,
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

  // Fetches real user data from database
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

        // Get user profile from database
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

        // Check if profile exists
        if (!profile) {
          console.error("No profile found for user");
          toast({
            title: "Error",
            description:
              "No profile found. Please complete registration first.",
            variant: "destructive",
          });
          return;
        }

        // Map database profile to component state
        const userData = {
          id: authUser.id,
          email: authUser.email || "",
          emailPreferences: {
            marketingEmails: profile.marketingEmails ?? false,
          },
          parkingPreference: (profile.parking || "Not sure") as
            | "Yes"
            | "No"
            | "Not sure",
          licensePlate: profile.licensePlate || "",
        };

        setUser(userData);

        // Reset forms with real data - only marketing emails
        emailPreferencesForm.reset({
          marketingEmails: userData.emailPreferences.marketingEmails,
        });

        parkingPreferencesForm.reset({
          parkingPreference: userData.parkingPreference,
          licensePlate: userData.licensePlate || "",
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
  }, [emailPreferencesForm, parkingPreferencesForm, supabase]);

  // Handle email preferences form submission - only marketing emails
  async function onEmailPreferencesSubmit(data: EmailPreferencesValues) {
    setIsLoading(true);

    try {
      // Update email preference in profile table in database
      const { error } = await updateProfile({
        marketingEmails: data.marketingEmails,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Preferences updated",
        description:
          "Your marketing email preference has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating email preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update email preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Handle parking preferences form submission
  async function onParkingPreferencesSubmit(data: ParkingPreferencesValues) {
    setIsLoading(true);

    try {
      // Update profile in database
      const updateData: any = {
        parking: data.parkingPreference,
      };

      // Only include license plate if parking is "Yes"
      if (data.parkingPreference === "Yes") {
        updateData.licensePlate = data.licensePlate;
      } else {
        updateData.licensePlate = null; // Clear license plate if not needed
      }

      const { error } = await updateProfile(updateData);

      if (error) {
        throw error;
      }

      toast({
        title: "Parking preferences updated",
        description: "Your parking preferences have been updated successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating parking preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update parking preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Handle password form submission
  async function onPasswordSubmit(data: PasswordFormValues) {
    setIsLoading(true);

    try {
      // Validate password match
      if (data.newPassword !== data.confirmPassword) {
        toast({
          title: "Error",
          description: "New passwords don't match",
          variant: "destructive",
        });
        return;
      }

      // Update password using Supabase auth
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) {
        throw error;
      }

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
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Handle profile deletion
  async function handleDeleteProfile() {
    setIsDeleting(true);

    try {
      // Delete user account from Supabase (this will cascade delete profile)
      const { error } = await supabase.auth.admin.deleteUser(user!.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Profile deleted",
        description:
          "Your profile has been deleted successfully. You will be redirected to the home page.",
        variant: "default",
      });

      // Redirect to home page
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error: any) {
      console.error("Error deleting profile:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to delete profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
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
              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertTitle>Email Notifications</AlertTitle>
                <AlertDescription>
                  All confirmed participants will automatically receive:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>
                      <strong>Event Updates:</strong> Important announcements,
                      schedule , and event reminders
                    </li>
                  </ul>
                  These emails are mandatory to ensure you don&apos;t miss
                  critical information for your MRUHacks experience.
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
                            <FormLabel>Marketing Emails (Optional)</FormLabel>
                            <FormDescription>
                              Get notified about future hackathons, tech events,
                              job opportunities from our sponsors, and exclusive
                              workshops. You can unsubscribe at any time.
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
                    Save Marketing Preference
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
                            <SelectItem value="Not sure">
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
