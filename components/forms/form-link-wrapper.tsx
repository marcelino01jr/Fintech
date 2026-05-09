"use client";

import { useFormStatus } from "react-dom";

/**
 * Wraps children and adds pointer-events-none + opacity when form is pending.
 * Use to disable links (e.g. "Lupa kata sandi?") during form submission.
 */
export function FormLinkWrapper({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <span
      className={pending ? "pointer-events-none opacity-40 select-none" : undefined}
      aria-disabled={pending}
    >
      {children}
    </span>
  );
}
