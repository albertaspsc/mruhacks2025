"use client";

import * as React from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadTrigger,
  FileUploadList,
  FileUploadItem,
  FileUploadItemPreview,
  FileUploadItemMetadata,
  FileUploadItemDelete,
} from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { useFormValidation } from "@/hooks/useFormValidation";

interface FileUploadFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  accept?: string;
  maxSize?: number; // in bytes
  onUpload?: (file: File) => Promise<string | null>;
  isUploading?: boolean;
  uploadError?: string;
  existingFileUrl?: string;
}

export function FileUploadField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  disabled = false,
  required = false,
  className,
  accept = ".pdf,.doc,.docx",
  maxSize = 5 * 1024 * 1024, // 5MB default
  onUpload,
  isUploading = false,
  uploadError,
  existingFileUrl,
}: FileUploadFieldProps<TFieldValues, TName>) {
  const [selectedFile, setSelectedFile] = React.useState<File | undefined>();
  const [error, setError] = React.useState<string>("");
  const { validateFile } = useFormValidation();

  const validateFileType = (file: File): string | null => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const validation = validateFile(file, maxSize, allowedTypes);
    return validation.isValid ? null : validation.error || "Invalid file";
  };

  const handleFileChange = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setError("");
    const validationError = validateFileType(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);

    if (onUpload) {
      try {
        const url = await onUpload(file);
        if (url) {
          // Update the form field with the URL
          control._formValues[name] = url;
        }
      } catch (err) {
        setError("Upload failed. Please try again.");
      }
    }
  };

  const handleFileReject = (file: File, message: string) => {
    setError(message);
  };

  const handleRemoveFile = () => {
    setSelectedFile(undefined);
    setError("");
    // Clear the form field
    control._formValues[name] = "";
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <div className="space-y-1">
            <FormLabel className="text-sm font-semibold">
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            {description && (
              <FormDescription className="text-sm text-muted-foreground">
                {description}
              </FormDescription>
            )}
          </div>

          {(error || uploadError) && (
            <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{error || uploadError}</p>
            </div>
          )}

          <FileUpload
            value={selectedFile ? [selectedFile] : []}
            onValueChange={handleFileChange}
            onFileValidate={validateFileType}
            onFileReject={handleFileReject}
            accept={accept}
            maxFiles={1}
            className="w-full max-w-md"
            disabled={disabled || isUploading}
          >
            <FileUploadDropzone>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center justify-center rounded-full border p-2.5">
                  {isUploading ? (
                    <Loader2 className="size-6 text-muted-foreground animate-spin" />
                  ) : (
                    <Upload className="size-6 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm font-medium">
                  {isUploading ? "Uploading..." : "Drag & drop your file here"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Or click to browse (PDF, DOC, DOCX only)
                </p>
              </div>
              <FileUploadTrigger asChild>
                <Button
                  className="mt-2 w-fit"
                  disabled={disabled || isUploading}
                  type="button"
                >
                  {isUploading ? "Uploading..." : "Browse files"}
                </Button>
              </FileUploadTrigger>
            </FileUploadDropzone>
            <FileUploadList>
              {selectedFile && (
                <FileUploadItem key={selectedFile.name} value={selectedFile}>
                  <FileUploadItemPreview />
                  <FileUploadItemMetadata />
                  <FileUploadItemDelete asChild>
                    <Button
                      variant="ghost"
                      className="size-7 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                      disabled={disabled || isUploading}
                      onClick={handleRemoveFile}
                      type="button"
                    >
                      <X className="size-4" />
                    </Button>
                  </FileUploadItemDelete>
                </FileUploadItem>
              )}
            </FileUploadList>
          </FileUpload>

          {/* Show existing file if no new file selected */}
          {existingFileUrl && !selectedFile && (
            <p className="mt-2 text-xs text-muted-foreground break-all">
              Existing file: {existingFileUrl}
            </p>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Convenience component for resume upload
export function ResumeUploadField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: Omit<FileUploadFieldProps<TFieldValues, TName>, "accept" | "maxSize">,
) {
  return (
    <FileUploadField
      {...props}
      accept=".pdf,.doc,.docx"
      maxSize={5 * 1024 * 1024} // 5MB
      description="Upload your resume to be considered for sponsor recruitment opportunities and internships."
    />
  );
}
