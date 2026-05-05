"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/app/actions";

const IDLE_TIMEOUT_MS = 20 * 60 * 1000; // 20 menit
const MAX_SESSION_MS  = 60 * 60 * 1000; // 1 jam
const CHECK_INTERVAL  = 30 * 1000;       // cek setiap 30 detik

const ACTIVITY_EVENTS = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];

export function ActivityTracker({ loginAt }: { loginAt: number }) {
  const lastActivityRef = useRef<number>(Date.now());
  const loginAtRef = useRef<number>(loginAt);
  const router = useRouter();

  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    // Register activity listeners
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true })
    );

    // Periodic check
    const interval = setInterval(async () => {
      const now = Date.now();
      const idle = now - lastActivityRef.current;
      const sessionAge = now - loginAtRef.current;

      if (idle >= IDLE_TIMEOUT_MS || sessionAge >= MAX_SESSION_MS) {
        clearInterval(interval);
        await signOut();
      }
    }, CHECK_INTERVAL);

    return () => {
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
      clearInterval(interval);
    };
  }, [handleActivity]);

  return null; // invisible component
}
