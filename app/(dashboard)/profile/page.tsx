import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, users } from "@/lib/db";
import { ProfileForm } from "@/components/profile/profile-form";
import { CurrencySelector } from "@/components/profile/currency-selector";
import { type CurrencyCode, isValidCurrency } from "@/lib/currency";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { message?: string; success?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profil</h1>
        <p className="mt-1 text-sm text-slate-500">Kelola akun dan keamanan Anda</p>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Informasi Akun</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-500">Username</span>
            <span className="text-sm font-medium text-slate-900">{user.username}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-500">Email</span>
            <span className="text-sm font-medium text-slate-900">{user.email}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-500">Bergabung sejak</span>
            <span className="text-sm font-medium text-slate-900">
              {new Date(user.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Mata Uang</h2>
        <p className="mt-1 text-sm text-slate-500">Pilih mata uang default untuk pencatatan keuangan Anda</p>
        <CurrencySelector currentCurrency={(isValidCurrency(user.currency) ? user.currency : "IDR") as CurrencyCode} />
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Ubah Kata Sandi</h2>
        <p className="mt-1 text-sm text-slate-500">Perbarui kata sandi untuk menjaga keamanan akun</p>
        <ProfileForm message={searchParams.message} success={searchParams.success} />
      </div>
    </div>
  );
}
