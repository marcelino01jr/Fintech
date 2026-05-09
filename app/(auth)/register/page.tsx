import Link from "next/link";
import { WalletCards, Mail, Lock, UserPlus, UserCircle } from "lucide-react";
import { signUp } from "@/app/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { PasswordInput } from "@/components/forms/password-input";
import { NoSpaceInput } from "@/components/forms/nospace-input";

export default function RegisterPage({ searchParams }: { searchParams: { message?: string } }) {
  return (
    <div className="rounded-3xl border border-slate-200/60 bg-white/80 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl sm:p-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/25">
          <UserPlus className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Buat akun Anda</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Lacak pengeluaran, anggaran, dan cashflow di satu tempat
        </p>
      </div>

      {/* Form */}
      <form action={signUp} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="username" className="text-sm font-medium text-slate-700">
            Username
          </label>
          <div className="relative">
            <UserCircle className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <NoSpaceInput
              id="username"
              name="username"
              type="text"
              required
              minLength={3}
              placeholder="SltnAccel"
              className="pl-10"
            />
          </div>
          <p className="text-xs text-slate-400">Minimal 3 karakter, akan ditampilkan di dashboard</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <NoSpaceInput
              id="email"
              name="email"
              type="email"
              required
              placeholder="nama@email.com"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Kata sandi
          </label>
          <PasswordInput
            id="password"
            name="password"
            minLength={6}
            required
            placeholder="Minimal 6 karakter"
          />
          <p className="text-xs text-slate-400">Minimal 6 karakter</p>
        </div>

        {searchParams.message && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {searchParams.message}
          </div>
        )}

        <SubmitButton className="h-12 w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30">
          Buat akun
        </SubmitButton>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-sm text-slate-500">
        Sudah terdaftar?{" "}
        <Link href="/login" className="font-semibold text-blue-600 transition-colors hover:text-blue-700">
          Masuk
        </Link>
      </p>
    </div>
  );
}
