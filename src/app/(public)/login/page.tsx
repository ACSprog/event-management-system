"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Input } from "@/components/ui";

export default function Login() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-3xl font-semibold">Sign in</h1>
      <p className="mt-1 text-ink-3">Use the phone number you bought tickets with.</p>
      {step === "phone" ? (
        <div className="mt-6 space-y-4">
          <Field label="Mobile number" error={err}><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0964 123 456" inputMode="tel" /></Field>
          <Button className="w-full" size="lg" onClick={() => (phone.replace(/\D/g, "").length < 10 ? setErr("Enter a 10-digit Zambian mobile number.") : (setErr(""), setStep("otp")))}>Send code</Button>
          <div className="relative py-2 text-center text-xs text-ink-3"><span className="bg-canvas px-2">or</span></div>
          <Button className="w-full" variant="secondary">Continue with Google</Button>
          <Button className="w-full" variant="secondary">Sign in with email</Button>
          <p className="text-center text-sm text-ink-3">Organiser or staff? <a href="/org/" className="font-semibold text-kafue">Sign in to your workspace</a></p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <Field label={`Code sent to ${phone}`} hint="Enter the 6-digit code from the SMS" error={err}><Input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" className="text-center text-2xl tracking-[0.5em]" /></Field>
          <Button className="w-full" size="lg" onClick={() => (otp.length !== 6 ? setErr("Enter the 6-digit code.") : router.push("/account/"))}>Sign in</Button>
          <button className="w-full text-sm text-kafue" onClick={() => setStep("phone")}>Use a different number</button>
        </div>
      )}
    </div>
  );
}
