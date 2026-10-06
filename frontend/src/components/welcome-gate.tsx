"use client";

import { useEffect } from "react";
import { useRouter } from "../../i18n/routing";

export const WELCOMED_KEY = "mb.welcomed";

// First visit on this device → show the /welcome landing page once.
export default function WelcomeGate() {
  const router = useRouter();
  useEffect(() => {
    try {
      if (!localStorage.getItem(WELCOMED_KEY)) router.replace("/welcome");
    } catch {
      // storage blocked — just stay in the app
    }
  }, [router]);
  return null;
}
