"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60",
        className
      )}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Memproses...
        </>
      ) : (
        children
      )}
    </button>
  );
}
