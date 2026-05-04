import Link from "next/link";
import { PieChart, ReceiptText, Target, Wallet, User } from "lucide-react";
import { LogoutButton } from "./logout-button";

const navItems = [
  { href: "/dashboard", label: "Beranda", icon: PieChart },
  { href: "/transactions", label: "Transaksi", icon: ReceiptText },
  { href: "/budgets", label: "Anggaran", icon: Target },
  { href: "/profile", label: "Profil", icon: User },
];

export function AppShell({ children, email, username }: { children: React.ReactNode; email?: string; username?: string }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),transparent_24%),linear-gradient(180deg,#f7fbff,_#f5f7fb)]">
      {/* Sidebar - glassmorphism style */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:flex lg:flex-col">
        {/* Glass background */}
        <div className="absolute inset-0 border-r border-white/40 bg-gradient-to-b from-white/60 via-white/40 to-blue-50/30 backdrop-blur-2xl" />
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-10 h-32 w-32 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-1/2 h-24 w-24 rounded-full bg-sky-300/10 blur-2xl" />

        <div className="relative flex flex-1 flex-col px-5 py-6">
          {/* Logo */}
          <Link href="/dashboard" className="mb-8 flex items-center gap-3 px-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25">
              <Wallet className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-lg font-bold text-slate-900">FinTrack</span>
              <span className="block text-xs font-medium text-slate-400">Keuangan pribadi</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-white/70 hover:text-slate-900 hover:shadow-sm"
              >
                <item.icon className="h-5 w-5 text-slate-400 transition-colors group-hover:text-blue-500" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Bottom branding */}
          <div className="mt-auto border-t border-white/50 pt-4">
            <p className="px-2 text-xs text-slate-400">created by SltnAccel</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-xl lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile logo */}
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-slate-900 lg:hidden">
              <Wallet className="h-5 w-5 text-primary" />
              FinTrack
            </Link>

            {/* Tablet nav */}
            <nav className="hidden items-center gap-1 sm:flex lg:hidden">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <item.icon className="h-5 w-5" />
                </Link>
              ))}
            </nav>

            {/* Right side: email + logout */}
            <div className="ml-auto">
              <LogoutButton email={email} username={username} />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-28 lg:px-8 lg:pb-6">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-1 border-t border-slate-200 bg-white/90 px-3 py-2 shadow-sm backdrop-blur-lg sm:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center justify-center rounded-xl px-2 py-1.5 text-[11px] text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <item.icon className="h-5 w-5" />
              <span className="mt-0.5">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
