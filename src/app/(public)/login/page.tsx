"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, cx, Field, Input } from "@/components/ui";
import { genderPurpose, genders, type Gender } from "@/lib/gender";
import { PhoneInput } from "@/components/phone-input";
import { emptyPhone, formatPhone, nationalDigits, phoneError, type Phone } from "@/lib/phone";

export default function Login() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp" | "profile">("phone");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [phone, setPhone] = useState<Phone>(emptyPhone());
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState("");
  // Preview: the sample attendee's number (…567) already has an account; any other number creates one.
  const isNew = !nationalDigits(phone).endsWith("567");

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-3xl font-semibold">{step === "profile" ? "Create your account" : "Sign in or sign up"}</h1>
      <p className="mt-1 text-ink-3">{step === "profile" ? "Almost done." : "Use your mobile number. If you bought tickets as a guest, they'll be waiting in your account."}</p>
      {step === "phone" ? (
        <div className="mt-6 space-y-4">
          <Field label="Mobile number" error={err} hint="Choose your country code, then type your number">
            <PhoneInput value={phone} onChange={(p) => { setPhone(p); setErr(""); }} invalid={!!err} />
          </Field>
          <Button className="w-full" size="lg" onClick={() => { const e = phoneError(phone); if (e) setErr(e); else { setErr(""); setStep("otp"); } }}>Send code</Button>
          <div className="relative py-2 text-center text-xs text-ink-3"><span className="bg-canvas px-2">or</span></div>
          <Button className="w-full" variant="secondary">Continue with Google</Button>
          <Button className="w-full" variant="secondary">Sign in with email</Button>
          <p className="text-center text-sm text-ink-3">Organiser or staff? <a href="/org/" className="font-semibold text-kafue">Sign in to your workspace</a></p>
        </div>
      ) : step === "otp" ? (
        <div className="mt-6 space-y-4">
          <Field label={`Code sent to ${formatPhone(phone)}`} hint="Enter the 6-digit code from the SMS" error={err}><Input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" className="text-center text-2xl tracking-[0.5em]" /></Field>
          <Button className="w-full" size="lg" onClick={() => { if (otp.length !== 6) return setErr("Enter the 6-digit code."); setErr(""); if (isNew) setStep("profile"); else router.push("/account/"); }}>Sign in</Button>
          <button className="w-full text-sm text-kafue" onClick={() => setStep("phone")}>Use a different number</button>
          <p className="text-center text-xs text-ink-3">New here? We&rsquo;ll create your account after this step.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <p className="rounded-lg bg-kafue-soft px-3 py-2 text-sm text-kafue-ink">Welcome! {formatPhone(phone)} is new to Eventra. Two quick details and your account is ready.</p>
          <Field label="Your name" hint="As it should appear on your tickets" error={err && !name.trim() ? "Enter your name." : undefined}><Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></Field>
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium">Gender</legend>
            <div className="grid grid-cols-3 gap-2" role="radiogroup">
              {genders.map((g) => (
                <button key={g} type="button" role="radio" aria-checked={gender === g} onClick={() => setGender(g)} className={cx("rounded-lg border px-2 py-2.5 text-sm", gender === g ? "border-kafue bg-kafue-soft font-semibold text-kafue-ink" : err && !gender ? "border-hibiscus" : "border-line hover:border-ink-3")}>{g}</button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-ink-3">{genderPurpose}</p>
          </fieldset>
          {err && <p className="text-sm text-hibiscus">{err}</p>}
          <Button className="w-full" size="lg" onClick={() => { if (!name.trim() || !gender) return setErr(!gender ? "Choose an option for gender. \"Prefer not to say\" is fine." : "Enter your name."); router.push("/account/"); }}>Create my account</Button>
        </div>
      )}
    </div>
  );
}
