"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Lock, Eye, EyeOff } from "lucide-react";

export function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [showPassword, setShowPassword] = useState(false);
  const { pending } = useFormStatus();

  return (
    <div className="relative">
      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        {...props}
        type={showPassword ? "text" : "password"}
        disabled={pending || props.disabled}
        onKeyDown={(e) => {
          if (e.key === " ") e.preventDefault();
          props.onKeyDown?.(e);
        }}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-12 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => !pending && setShowPassword(!showPassword)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none disabled:pointer-events-none disabled:opacity-30"
        aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
