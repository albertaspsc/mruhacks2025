"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminWorkshopFormSchema, AdminWorkshopFormData } from "@/types/admin";
import { TextInputField, TextareaField } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface WorkshopFormProps {
  initialData?: Partial<AdminWorkshopFormData>;
  onSubmit: (data: AdminWorkshopFormData) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
  error?: string | null;
}

export function WorkshopForm({
  initialData,
  onSubmit,
  loading = false,
  submitLabel = "Save Workshop",
  error,
}: WorkshopFormProps) {
  const form = useForm<AdminWorkshopFormData>({
    resolver: zodResolver(AdminWorkshopFormSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      maxCapacity: 30,
      isActive: true,
      ...initialData,
    },
  });

  const handleSubmit = async (data: AdminWorkshopFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Error handling done by parent
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workshop Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <TextInputField
            control={form.control}
            name="title"
            label="Workshop Title"
            placeholder="e.g., Introduction to React"
            required
          />

          <TextareaField
            control={form.control}
            name="description"
            label="Description"
            placeholder="Describe what participants will learn..."
            rows={4}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">
                    Date
                    <span className="text-destructive ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="mt-1 pr-10 text-black"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxCapacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">
                    Max Capacity
                    <span className="text-destructive ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      className="mt-1 pr-10 text-black"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">
                    Start Time
                    <span className="text-destructive ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      className="mt-1 pr-10 text-black"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">
                    End Time
                    <span className="text-destructive ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      className="mt-1 pr-10 text-black"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <TextInputField
            control={form.control}
            name="location"
            label="Location"
            placeholder="e.g., Room A101, Main Building"
            required
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-medium">
                    Workshop is active
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
