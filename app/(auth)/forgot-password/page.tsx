import Link from "next/link";
import { KeyRound, Mail, ArrowLeft, MailCheck } from "lucide-react";
import { requestPasswordReset } from "@/app/actions";
import { SubmitButton } from "@/components/forms/submit-button";

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { message?: string; sent?: string };
}) {
  // Success state — email sent
  if (searchParams.sent) {
    return (
      <div className="rounded-3xl border border-slate-200/60 bg-white/80 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl sm:p-10">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-green-500/25">
            <MailCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Cek email Anda</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Jika email terdaftar, kami telah mengirimkan link reset kata sandi.
            Link berlaku selama <span className="font-semibold text-slate-700">1 jam</span>.
          </p>
          <div className="mt-6 w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Tidak menerima email? Cek folder <strong>Spam</strong> atau coba lagi.
          </div>
          <div className="mt-6 flex w-full flex-col gap-3">
            <Link
              href="/forgot-password"
              className="flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Kirim ulang
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke halaman masuk
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200/60 bg-white/80 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl sm:p-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/25">
          <KeyRound className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Lupa kata sandi?</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Masukkan email Anda dan kami kirimkan link untuk reset kata sandi
        </p>
      </div>

      {/* Form */}
      <form action={requestPasswordReset} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="nama@email.com"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {searchParams.message && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {searchParams.message}
          </div>
        )}

        <SubmitButton className="h-12 w-full rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/30">
          Kirim Link Reset
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
