"use client";

import { useForm } from "react-hook-form";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParkingState } from "@/types/registration";
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
import {
  Loader2,
  AlertTriangle,
  Car,
  Info,
  CheckCircle,
  XCircle,
  Mail,
  Lock,
  User,
} from "lucide-react";
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
  getMarketingPreference,
} from "@/db/settings";
import { UserRegistration } from "@/types/registration";
import { getRegistrationDataAction } from "@/actions/registrationActions";
import { updateUserEmailAction } from "@/actions/profileActions";
import { createClient } from "@/utils/supabase/client";
import { useFormValidation } from "@/components/hooks";

// Toast component for better UX
type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg border ${getStyles()} shadow-lg z-50 max-w-md`}
    >
      <div className="flex items-center gap-2">
        {getIcon()}
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="ml-auto text-gray-400 hover:text-gray-600"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Form types
type EmailPreferencesValues = {
  marketingEmails: boolean;
};

type EmailChangeValues = {
  newEmail: string;
};

type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type ParkingPreferencesValues = {
  parkingPreference: ParkingState;
  licensePlate: string;
};

export default function SettingsPage() {
  const supabase = createClient();
  const { validatePassword, validateLicensePlate, validateEmail } =
    useFormValidation({
      password: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
      },
    });
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserRegistration>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState({
    email: false,
    emailChange: false,
    parking: false,
    password: false,
  });
  const [userId, setUserId] = useState<string>("");

  // Show toast function
  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  // Email preferences form
  const emailPreferencesForm = useForm<EmailPreferencesValues>({
    defaultValues: {
      marketingEmails: false,
    },
  });

  // Email change form
  const emailChangeForm = useForm<EmailChangeValues>({
    defaultValues: {
      newEmail: "",
    },
    mode: "onChange",
  });

  // Password form with validation
  const passwordForm = useForm<PasswordFormValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  // Parking preferences form
  const parkingPreferencesForm = useForm<ParkingPreferencesValues>({
    defaultValues: {
      parkingPreference: "Not sure",
      licensePlate: "",
    },
    mode: "onChange",
  });

  // Load user data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Get user registration data
        const supabase = createClient();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) throw new Error("Not authenticated");
        setUserId(auth.user.id);
        const regResult = await getRegistrationDataAction();
        if (!regResult.success)
          throw new Error(regResult.error || "Failed to get user data");
        setUser(regResult.data || undefined);

        // Get parking preferences
        const { data: parkingData, error: parkingError } =
          await getParkingPreference();
        if (parkingError) {
          let errorMessage = "";

          if (typeof parkingError === "string") {
            errorMessage = parkingError;
          } else if (parkingError && typeof parkingError === "object") {
            errorMessage =
              parkingError.message ||
              parkingError.toString() ||
              "Unknown error";
          }

          // Only log actual errors, not "not found" cases
          if (
            errorMessage &&
            !errorMessage.toLowerCase().includes("not found")
          ) {
            console.error("Error loading parking preferences:", parkingError);
          }
          // Set default values for new users
          parkingPreferencesForm.reset({
            parkingPreference: "Not sure",
            licensePlate: "",
          });
        } else if (parkingData) {
          parkingPreferencesForm.reset({
            parkingPreference: parkingData.parking || "Not sure",
            licensePlate: parkingData.licensePlate || "",
          });
        }

        // Get marketing preferences
        const { data: marketingData, error: marketingError } =
          await getMarketingPreference();

        if (marketingError) {
          let shouldLogError = false;
          let errorMessage = "";

          if (typeof marketingError === "string") {
            errorMessage = marketingError;
            shouldLogError = !errorMessage.toLowerCase().includes("not found");
          } else if (marketingError && typeof marketingError === "object") {
            // Check if it's an empty object
            const isEmptyObject = Object.keys(marketingError).length === 0;
            if (!isEmptyObject) {
              errorMessage =
                marketingError.message || JSON.stringify(marketingError);
              shouldLogError = !errorMessage
                .toLowerCase()
                .includes("not found");
            }
            // For empty objects, don't log anything - this is expected for new users
          }

          // Only log if it's a real error
          if (shouldLogError) {
            console.error(
              "Error loading marketing preferences:",
              marketingError,
            );
          }

          // Set default values - NEW USERS SUBSCRIBED BY DEFAULT
          emailPreferencesForm.reset({
            marketingEmails: true,
          });
        } else if (marketingData) {
          emailPreferencesForm.reset({
            marketingEmails: marketingData.sendEmails !== false,
          });
        } else {
          // Fallback case - also default to subscribed
          emailPreferencesForm.reset({
            marketingEmails: true,
          });
        }
      } catch (error) {
        console.error("Error loading data:", error);
        showToast("Failed to load settings. Please refresh the page.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [emailPreferencesForm, parkingPreferencesForm]);

  // Handle email preferences submission
  async function onEmailPreferencesSubmit(data: EmailPreferencesValues) {
    setIsSubmitting((prev) => ({ ...prev, email: true }));
    try {
      const { error } = await updateMarketingPreferences(data.marketingEmails);
      if (error) throw error;

      showToast("Email preferences updated successfully!", "success");
    } catch (error) {
      console.error("Error updating email preferences:", error);
      showToast(
        "Failed to update email preferences. Please try again.",
        "error",
      );
    } finally {
      setIsSubmitting((prev) => ({ ...prev, email: false }));
    }
  }

  // Handle email change submission
  async function onEmailChangeSubmit(data: EmailChangeValues) {
    // Validate email
    const emailResult = validateEmail(data.newEmail);
    if (!emailResult.isValid) {
      emailChangeForm.setError("newEmail", {
        message: emailResult.error || "Invalid email address",
      });
      return;
    }

    // Check if email is different from current
    if (data.newEmail === user?.email) {
      emailChangeForm.setError("newEmail", {
        message: "This is already your current email address",
      });
      return;
    }

    setIsSubmitting((prev) => ({ ...prev, emailChange: true }));
    try {
      const result = await updateUserEmailAction(data.newEmail);
      if (!result.success) {
        throw new Error(result.error);
      }

      // Reset form on success
      emailChangeForm.reset({
        newEmail: "",
      });

      showToast(
        "Verification email sent! Please check your new email address to complete the change.",
        "success",
      );
    } catch (error) {
      console.error("Error updating email:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to update email. Please try again.",
        "error",
      );
    } finally {
      setIsSubmitting((prev) => ({ ...prev, emailChange: false }));
    }
  }

  // Handle parking preferences submission
  async function onParkingPreferencesSubmit(data: ParkingPreferencesValues) {
    // Validate license plate if parking is required
    if (data.parkingPreference === "Yes") {
      const licenseResult = validateLicensePlate(data.licensePlate);
      if (!licenseResult.isValid) {
        parkingPreferencesForm.setError("licensePlate", {
          message: licenseResult.error || "Invalid license plate",
        });
        return;
      }
    }

    setIsSubmitting((prev) => ({ ...prev, parking: true }));
    try {
      const { error } = await updateParkingPreferences(data);
      if (error) throw error;

      showToast("Parking preferences updated successfully!", "success");
    } catch (error) {
      console.error("Error updating parking preferences:", error);
      showToast(
        "Failed to update parking preferences. Please try again.",
        "error",
      );
    } finally {
      setIsSubmitting((prev) => ({ ...prev, parking: false }));
    }
  }

  // Handle password submission with validation
  async function onPasswordSubmit(data: PasswordFormValues) {
    // Validate new password
    const passwordResult = validatePassword(data.newPassword);
    if (!passwordResult.isValid) {
      passwordForm.setError("newPassword", {
        message: passwordResult.errors[0] || "Invalid password",
      });
      return;
    }

    // Check password confirmation
    if (data.newPassword !== data.confirmPassword) {
      passwordForm.setError("confirmPassword", {
        message: "Passwords do not match",
      });
      return;
    }

    setIsSubmitting((prev) => ({ ...prev, password: true }));
    try {
      // First, verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: data.currentPassword,
      });

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          passwordForm.setError("currentPassword", {
            message: "Current password is incorrect",
          });
          return;
        }
        throw signInError;
      }

      // If current password is correct, update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (updateError) {
        if (updateError.message.includes("session")) {
          showToast("Your session has expired. Please log in again.", "error");
          setTimeout(() => (window.location.href = "/login"), 2000);
          return;
        }
        throw updateError;
      }

      // Reset form on success
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      showToast("Password updated successfully!", "success");
    } catch (error) {
      console.error("Error updating password:", error);
      showToast("Failed to update password. Please try again.", "error");
    } finally {
      setIsSubmitting((prev) => ({ ...prev, password: false }));
    }
  }

  // Handle account deletion
  async function handleDeleteProfile() {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete account");
      }

      // Success
      setShowDeleteConfirm(false);
      showToast("Account deleted successfully. Redirecting...", "success");

      // Sign out and redirect
      await supabase.auth.signOut();
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      console.error("Account deletion error:", error);
      showToast("Failed to delete account. Please contact support.", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  // Show loading state
  if (isLoading && !user) {
    return <LoadingSpinner />;
  }

  // Watch parking preference
  const parkingPreference = parkingPreferencesForm.watch("parkingPreference");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-4xl py-6 px-2 sm:px-4 relative">
        {/* Toast notifications */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 px-2">
          Account Settings
        </h1>

        <Tabs defaultValue="email" className="w-full">
          {/* Responsive tabs */}
          <TabsList className="grid w-full grid-cols-4 mb-6 sm:mb-8 h-auto p-1">
            <TabsTrigger
              value="email"
              className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 px-1 py-2 text-xs min-w-0 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Mail className="h-4 w-4 shrink-0" />
              <span className="hidden min-[375px]:block leading-tight text-[10px] sm:text-xs">
                Email
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="parking"
              className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 px-1 py-2 text-xs min-w-0 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Car className="h-4 w-4 shrink-0" />
              <span className="hidden min-[375px]:block leading-tight text-[10px] sm:text-xs">
                Parking
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 px-1 py-2 text-xs min-w-0 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Lock className="h-4 w-4 shrink-0" />
              <span className="hidden min-[375px]:block leading-tight text-[10px] sm:text-xs">
                Password
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 px-1 py-2 text-xs min-w-0 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <User className="h-4 w-4 shrink-0" />
              <span className="hidden min-[375px]:block leading-tight text-[10px] sm:text-xs">
                Account
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Email Preferences Tab */}
          <TabsContent value="email">
            <div className="space-y-6">
              {/* Email Change Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Change Email Address
                  </CardTitle>
                  <CardDescription>
                    Update your email address. You&apos;ll receive a
                    verification email to confirm the change.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...emailChangeForm}>
                    <form
                      onSubmit={emailChangeForm.handleSubmit(
                        onEmailChangeSubmit,
                      )}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <FormLabel>Current Email</FormLabel>
                        <Input
                          value={user?.email || ""}
                          disabled
                          className="bg-gray-50"
                        />
                        <FormDescription>
                          Your current email address
                        </FormDescription>
                      </div>

                      <FormField
                        control={emailChangeForm.control}
                        name="newEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Email Address</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your new email address"
                                type="email"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter the new email address you want to use for
                              your account.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={isSubmitting.emailChange}
                        className="w-full sm:w-auto"
                      >
                        {isSubmitting.emailChange && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Send Verification Email
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Email Preferences Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Mandatory Email Notice */}
                  <Alert className="mb-6">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Notice</AlertTitle>
                    <AlertDescription>
                      All confirmed participants will receive mandatory
                      logistics emails with essential event information and
                      updates. These emails cannot be opted out of to ensure you
                      don&apos;t miss critical details for your MRUHacks
                      experience.
                    </AlertDescription>
                  </Alert>

                  <Form {...emailPreferencesForm}>
                    <form
                      onSubmit={emailPreferencesForm.handleSubmit(
                        onEmailPreferencesSubmit,
                      )}
                      className="space-y-6"
                    >
                      <FormField
                        control={emailPreferencesForm.control}
                        name="marketingEmails"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border p-4">
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

                      <Button
                        type="submit"
                        disabled={isSubmitting.email}
                        className="w-full sm:w-auto"
                      >
                        {isSubmitting.email && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save Preferences
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
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
                  Update your parking needs and license plate information for
                  the event.
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
                              <SelectItem value="Not sure">Not sure</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            This helps us plan parking capacity for the event.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* License Plate Field */}
                    {parkingPreference === "Yes" && (
                      <FormField
                        control={parkingPreferencesForm.control}
                        name="licensePlate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Plate Number *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. ABC-123"
                                {...field}
                                className="uppercase"
                                onChange={(e) => {
                                  field.onChange(e.target.value.toUpperCase());
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter your vehicle&apos;s license plate number.
                              This will help with parking coordination and
                              security.
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
                        {parkingPreference === "Yes" &&
                          "Parking will be available at Mount Royal University. Please arrive early as spaces are limited."}
                        {parkingPreference === "No" &&
                          "Consider carpooling or using public transportation. The event location is accessible via Calgary Transit."}
                        {parkingPreference === "Not sure" &&
                          "You can update this preference closer to the event date. We recommend deciding at least 1 week before the event."}
                      </AlertDescription>
                    </Alert>

                    <Button
                      type="submit"
                      disabled={isSubmitting.parking}
                      className="w-full sm:w-auto"
                    >
                      {isSubmitting.parking && (
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
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
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
                              placeholder="Enter your current password"
                              type="password"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter your current password to verify your identity.
                          </FormDescription>
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
                              placeholder="Enter your new password"
                              type="password"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Must be at least 8 characters with uppercase,
                            lowercase, number, and special character.
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
                              placeholder="Confirm your new password"
                              type="password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isSubmitting.password}
                      className="w-full sm:w-auto"
                    >
                      {isSubmitting.password && (
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
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Delete Account
                </CardTitle>
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
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                      <Button
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleDeleteProfile}
                        disabled={isDeleting}
                        className="w-full sm:w-auto"
                      >
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
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full sm:w-auto"
                  >
                    Delete Account
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
