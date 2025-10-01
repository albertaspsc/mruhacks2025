"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useConfirmedCount, useRegistrationStatus } from "./states";
import { Button, ButtonProps } from "@/components/ui/button";
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
import { useActionState, useState } from "react";
import { confirmRsvp, rescindRsvp, fcsfRsvp } from "@/actions/rsvpActions";
import { RegistrationStatus } from "@/components/dashboards/shared/ui/StatusBanner";
const CAPACITY = 150;

export function RSVPButton({ disabled }: { disabled?: boolean }) {
  const [hasBeenClicked, setHasBeenClicked] = useState(false);
  const action = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasBeenClicked) return;
    setHasBeenClicked(true);

    confirmRsvp();
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
  const [open, setOpen] = useState(false);

  // useActionState will handle disabling + pending state
  const [hasBeenClicked, submitAction, isPending] = useActionState(async () => {
    await rescindRsvp();
    setOpen(false); // close dialog after success
    return true;
  }, false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
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
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

          <form action={submitAction}>
            <Button
              type="submit"
              variant="destructive"
              disabled={hasBeenClicked || isPending}
            >
              {isPending ? "Submitting..." : "Yes, decline"}
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function FcsfRsvpButton({
  disabled,
  ...props
}: { disabled?: boolean } & ButtonProps) {
  const [hasBeenClicked, submitAction, isPending] = useActionState(async () => {
    await fcsfRsvp();
    return true;
  }, false);

  return (
    <form action={submitAction}>
      <Button
        type="submit"
        disabled={disabled || hasBeenClicked || isPending}
        {...props}
      >
        {isPending ? "Submitting..." : "RSVP"}
      </Button>
    </form>
  );
}

const messages: Partial<Record<RegistrationStatus, string>> = {
  confirmed: "You’ve confirmed your spot. See you at the event!",
  pending: "Your registration is pending. Please RSVP to secure your spot.",
  waitlisted:
    "We don't have a spot for you at this time. We'll email you if a slot opens up.",
};

export function LiveStatusMessage() {
  const confirmedCount = useConfirmedCount();
  const status = useRegistrationStatus();

  if (confirmedCount.loading || status.loading)
    return <Skeleton className="h-4 w-80" />;

  const { count } = confirmedCount;
  const spotsLeft = CAPACITY - count;
  const isFull = spotsLeft <= 0;

  if (status.status === "pending")
    return isFull
      ? "The event is now full. We hope to see you next year!"
      : `Save your spot now! Only ${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left!`;
  else return messages[status.status];
}
