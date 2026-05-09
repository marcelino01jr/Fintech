import Link from "next/link";
import { Wallet, Mail, Lock, Check } from "lucide-react";
import { signIn } from "@/app/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { PasswordInput } from "@/components/forms/password-input";
import { NoSpaceInput } from "@/components/forms/nospace-input";
import { FormLinkWrapper } from "@/components/forms/form-link-wrapper";

export default function LoginPage({ searchParams }: { searchParams: { message?: string; success?: string } }) {
  return (
    <div className="rounded-3xl border border-slate-200/60 bg-white/80 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl sm:p-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
          <Wallet className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Selamat datang kembali</h1>
      </div>

      {/* Form */}
      <form action={signIn} className="space-y-5">
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
            required
            placeholder="••••••••"
          />
        </div>

        <div className="flex justify-end">
          <FormLinkWrapper>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              Lupa kata sandi?
            </Link>
          </FormLinkWrapper>
        </div>

        {searchParams.message && (
          searchParams.message.includes("berhasil") ? (
            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <Check className="h-4 w-4 shrink-0" />
              {searchParams.message}
            </div>
          ) : (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {searchParams.message}
            </div>
          )
        )}

        <SubmitButton className="h-12 w-full rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30">
          Masuk
        </SubmitButton>

        {/* Footer — inside form so useFormStatus works */}
        <p className="text-center text-sm text-slate-500">
          Belum punya akun?{" "}
          <FormLinkWrapper>
            <Link href="/register" className="font-semibold text-blue-600 transition-colors hover:text-blue-700">
              Buat akun
            </Link>
          </FormLinkWrapper>
        </p>
      </form>
    </div>
  );
}
