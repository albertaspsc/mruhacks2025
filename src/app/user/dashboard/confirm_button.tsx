"use client";

import { Button } from "@/components/ui/button";

import { confirm } from "./api";

export default function RSVPButton() {
  return (
    <form action={confirm}>
      <Button variant="primary" type="submit">
        RSVP
      </Button>
    </form>
  );
}
