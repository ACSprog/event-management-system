"use client";

import { useState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui";

/**
 * A drop-down whose last choice lets people type their own answer.
 * When the "other" choice is picked, a text box appears underneath.
 * The API stores the typed text alongside the choice (e.g. reason = OTHER, reason_text = "…").
 */
export function SelectOther({
  label, options, other = "Other", prompt, placeholder, hint, multiline, defaultValue, onChange, error,
}: {
  label: string;
  options: string[];
  other?: string;
  prompt: string;
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
  defaultValue?: string;
  onChange?: (choice: string, text: string) => void;
  error?: string;
}) {
  const [choice, setChoice] = useState(defaultValue ?? options[0]);
  const [text, setText] = useState("");
  const isOther = choice === other;
  return (
    <div className="space-y-3">
      <Field label={label} hint={isOther ? undefined : hint}>
        <Select value={choice} onChange={(e) => { setChoice(e.target.value); onChange?.(e.target.value, text); }} options={[...options, other]} />
      </Field>
      {isOther && (
        <Field label={prompt} error={error}>
          {multiline
            ? <Textarea rows={3} value={text} placeholder={placeholder} onChange={(e) => { setText(e.target.value); onChange?.(choice, e.target.value); }} />
            : <Input value={text} placeholder={placeholder} onChange={(e) => { setText(e.target.value); onChange?.(choice, e.target.value); }} />}
        </Field>
      )}
    </div>
  );
}
