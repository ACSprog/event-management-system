"use client";

import { useEffect } from "react";
import { startAnalytics } from "@/lib/firebase";

/** Loads Firebase Analytics after the page is interactive. Renders nothing. */
export function FirebaseAnalytics() {
  useEffect(() => {
    startAnalytics().catch(() => {});
  }, []);
  return null;
}
