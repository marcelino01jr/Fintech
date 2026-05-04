"use client";

import { Lock, Check } from "lucide-react";
import { updatePassword } from "@/app/actions";
import { SubmitButton } from "@/components/forms/submit-button";

export function ProfileForm({ message, success }: { message?: string; success?: string }) {
  return (
    <form action={updatePassword} className="mt-5 space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="new_password" className="text-sm font-medium text-slate-700">
          Kata sandi baru
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="new_password"
            name="new_password"
            type="password"
            minLength={6}
            required
            placeholder="Minimal 6 karakter"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirm_password" className="text-sm font-medium text-slate-700">
          Konfirmasi kata sandi
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            minLength={6}
            required
            placeholder="Ulangi kata sandi baru"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {message}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <Check className="h-4 w-4" />
          {success}
        </div>
      )}

      <SubmitButton className="h-11 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/25">
        Perbarui Kata Sandi
      </SubmitButton>
    </form>
  );
}
