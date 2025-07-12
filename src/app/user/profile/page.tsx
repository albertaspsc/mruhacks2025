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
import { getRegistration, Registration } from "src/db/registration";
import { createClient } from "utils/supabase/client";
import { redirect } from "next/navigation";
import { z } from "zod";
import { updateUserNameAndEmail } from "src/db/settings";

// Types
type User = Pick<Registration, "firstName" | "lastName" | "email">;
type ProfileValues = {
  firstName: string;
  lastName: string;
  email: string;
};
type ToastType = "success" | "error";
interface ToastState {
  type: ToastType;
  title: string;
  description?: string;
}

const ToastBanner = ({
  toast,
  onClose,
  duration = 3000,
}: {
  toast: ToastState | null;
  onClose: () => void;
  duration?: number;
}) => {
  useEffect(() => {
    if (toast) {
      const timeout = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [toast, duration, onClose]);

  if (!toast) return null;

  const baseStyle =
    "fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-md shadow-md z-50 text-sm transition-all duration-300";
  const variantStyle =
    toast.type === "success"
      ? "bg-green-100 text-green-800 border border-green-300"
      : "bg-red-100 text-red-800 border border-red-300";

  return (
    <div className={`${baseStyle} ${variantStyle}`}>
      <strong className="block">{toast.title}</strong>
      {toast.description && <div>{toast.description}</div>}
      <button
        onClick={onClose}
        className="absolute top-1 right-2 text-xs underline"
      >
        Close
      </button>
    </div>
  );
};

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const supabase = createClient();

  const profileForm = useForm<ProfileValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: registration } = await getRegistration();
        if (registration) {
          setUser(registration ?? null);
          profileForm.setValue("firstName", registration.firstName);
          profileForm.setValue("lastName", registration.lastName);
          profileForm.setValue("email", registration.email);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  async function onProfileSubmit(data: ProfileValues) {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const isValidEmail = z.string().email().safeParse(data.email).success;
      if (data.email !== user?.email && isValidEmail) {
        const { error: emailUpdateError } = await supabase.auth.updateUser({
          email: data.email,
        });
        if (emailUpdateError) throw new Error("Email update failed.");
      }

      const { error } = await updateUserNameAndEmail(data);
      if (error) throw new Error("Failed to update name or email.");

      setSaveSuccess(true);
    } catch (err: any) {
      setToast({
        type: "error",
        title: "Update failed",
        description: err?.message || "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  }

  if (isLoading && !user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container max-w-2xl py-10">
      <ToastBanner toast={toast} onClose={() => setToast(null)} />

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

              <Button
                type="button"
                className="ml-4"
                disabled={isSaving}
                onClick={() => redirect("/user/dashboard")}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Back
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
