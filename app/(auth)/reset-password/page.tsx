import Link from "next/link";
import { ShieldCheck, Lock, ArrowLeft } from "lucide-react";
import { resetPassword } from "@/app/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { PasswordInput } from "@/components/forms/password-input";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  return (
    <div className="rounded-3xl border border-slate-200/60 bg-white/80 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl sm:p-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-green-500/25">
          <ShieldCheck className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Buat kata sandi baru</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Masukkan kata sandi baru untuk akun Anda
        </p>
      </div>

      {/* Form */}
      <form action={resetPassword} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="new_password" className="text-sm font-medium text-slate-700">
            Kata sandi baru
          </label>
          <PasswordInput
            id="new_password"
            name="new_password"
            minLength={6}
            required
            placeholder="Minimal 6 karakter"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirm_password" className="text-sm font-medium text-slate-700">
            Konfirmasi kata sandi
          </label>
          <PasswordInput
            id="confirm_password"
            name="confirm_password"
            minLength={6}
            required
            placeholder="Ulangi kata sandi baru"
          />
          <p className="text-xs text-slate-400">Minimal 6 karakter</p>
        </div>

        {searchParams.message && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {searchParams.message}
          </div>
        )}

        <SubmitButton className="h-12 w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-green-500 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:shadow-xl hover:shadow-green-500/30">
          Simpan Kata Sandi Baru
        </SubmitButton>
      </form>

      {/* Back to login */}
      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke halaman masuk
        </Link>
      </div>
    </div>
  );
}
