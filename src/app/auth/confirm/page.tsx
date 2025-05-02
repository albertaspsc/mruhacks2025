"use client";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "../../../../utils/supabase/client";
import { redirect, useSearchParams } from "next/navigation";
import { Suspense, use, useEffect, useState } from "react";
import { z } from "zod";
import { BindInput } from "../../../components/BindInput/BindInput";

export default function Page() {
  return (
    <>
      <Suspense>
        <EmailConfirmation></EmailConfirmation>
      </Suspense>
    </>
  );
}

function EmailConfirmation() {
  const supabase = createClient();

  const searchParams = useSearchParams();
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const emailSearchParam = searchParams.get("email");
  const emailSchema = z.string().email();
  const { data: parsedEmail } = emailSchema.safeParse(emailSearchParam);
  const [email, setEmail] = useState(parsedEmail);

  const [seconds, setSeconds] = useState(5);
  const [showResend, setShowResend] = useState(false);

  useEffect(() => {
    const verifyOtp = async () => {
      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
          type,
          token_hash,
        });
        if (!error) {
          redirect("/register");
        } else {
          // TODO - redirect the user to an error page with some instructions
          //
          // See github issue #70
          redirect("/error");
        }
      }
    };

    verifyOtp();
  });

  useEffect(() => {
    if (seconds === 0) {
      setShowResend(true);
      return;
    }

    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const onClick = () => {
    if (email) {
      supabase.auth.resend({ email, type: "signup" });
    } else {
      prompt("no email provided");
    }
  };

  return (
    <>
      <form>
        <h1>Check your email!</h1>
        <label htmlFor="email">Email</label>
        <BindInput
          type="email"
          name="email"
          id="email"
          getState={email}
          setState={setEmail}
        />
        {showResend ? (
          <button onClick={onClick}>Resend</button>
        ) : (
          <button style={{ color: "grey", cursor: "not-allowed" }}>
            Resend in {seconds} seconds
          </button>
        )}
      </form>
    </>
  );
}
