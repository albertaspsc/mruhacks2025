"use client";

import { Button } from "@/components/ui/button";
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
import { confirm, deny } from "./api";
import { useState } from "react";

export default function RSVPButton({ disabled }: { disabled?: boolean }) {
  const [hasBeenClicked, setHasBeenClicked] = useState(false);
  const action = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasBeenClicked) return;
    setHasBeenClicked(true);

    confirm();
  };

  return (
    <form onSubmit={action}>
      <Button type="submit" disabled={disabled || hasBeenClicked}>
        RSVP
      </Button>
    </form>
  );
}

type Props = {
  label?: string;
};

export function ConfirmDecline({ label = "Decline" }: Props) {
  const [hasBeenClicked, setHasBeenClicked] = useState(false);

  const handleDecline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasBeenClicked) return;
    setHasBeenClicked(true);

    await deny();
  };

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

          {/* debounced submit */}
          <form onSubmit={handleDecline}>
            <Button
              type="submit"
              variant="destructive"
              disabled={hasBeenClicked}
            >
              Yes, decline
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
