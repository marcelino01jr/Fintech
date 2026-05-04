import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { OtpForm } from "@/components/auth/otp-form";

export default function VerifyOtpPage({
  searchParams,
}: {
  searchParams: { email?: string; message?: string };
}) {
  const email = searchParams.email ?? "";

  return (
    <div className="rounded-3xl border border-slate-200/60 bg-white/80 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl sm:p-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-purple-500/25">
          <ShieldCheck className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Masukkan kode OTP</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Kode 6 digit telah dikirim ke{" "}
          <span className="font-medium text-slate-700">{email || "email Anda"}</span>
        </p>
      </div>

      <OtpForm email={email} message={searchParams.message} />

      {/* Footer */}
      <div className="mt-6 space-y-3 text-center">
        <p className="text-sm text-slate-500">
          Tidak menerima kode?{" "}
          <Link
            href={`/forgot-password`}
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Kirim ulang
          </Link>
        </p>
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
