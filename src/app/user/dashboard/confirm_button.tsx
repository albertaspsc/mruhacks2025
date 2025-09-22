"use client";

import { Button } from "@/components/ui/button";

import { confirm, deny } from "./api";

export default function RSVPButton({ disabled }: { disabled?: boolean }) {
  return (
    <form action={confirm}>
      <Button type="submit" disabled={disabled}>
        RSVP
      </Button>
    </form>
  );
}

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

type Props = {
  // Keep flexible: works whether your action expects FormData or nothing
  label?: string;
};

export function ConfirmDecline({ label = "Decline" }: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">{label}</Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm decline</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to decline? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          {/* Keep the server action semantics via a form submit */}
          <form action={deny}>
            <Button type="submit" variant="destructive">
              Yes, decline
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
