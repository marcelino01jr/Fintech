"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { LogOut, X, AlertTriangle, ChevronDown, User, Shield } from "lucide-react";
import Link from "next/link";
import { signOut } from "@/app/actions";
import { cn } from "@/lib/utils";

export function LogoutButton({ email, username }: { email?: string; username?: string }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);

  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : email?.slice(0, 2).toUpperCase() ?? "??";

  useEffect(() => setMounted(true), []);

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [dropdownOpen]);

  // Close confirm on outside click + lock scroll
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (confirmRef.current && !confirmRef.current.contains(e.target as Node)) {
        setShowConfirm(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setShowConfirm(false);
    }
    if (showConfirm) {
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [showConfirm]);

  const confirmModal = showConfirm && mounted
    ? createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div
            ref={confirmRef}
            className="relative w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <button
              onClick={() => setShowConfirm(false)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                <AlertTriangle className="h-7 w-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Keluar dari akun?</h3>
              <p className="mt-2 text-sm text-slate-500">
                Anda akan keluar dari{" "}
                <span className="font-semibold text-slate-700">{username || email}</span>.
                Yakin ingin melanjutkan?
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Batal
              </button>
              <form action={signOut} className="flex-1">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-500/20 transition-all hover:shadow-lg hover:shadow-red-500/30"
                >
                  <LogOut className="h-4 w-4" />
                  Ya, Keluar
                </button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div ref={dropdownRef} className="relative">
        {/* Trigger button */}
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className={cn(
            "flex items-center gap-2.5 rounded-2xl border px-3 py-1.5 transition-all",
            dropdownOpen
              ? "border-blue-200 bg-blue-50 shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
          )}
          aria-label="Menu akun"
        >
          {/* Avatar */}
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
            {initials}
          </div>
          <span className="hidden max-w-[120px] truncate text-sm font-medium text-slate-700 sm:block">
            {username || email?.split("@")[0]}
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-slate-400 transition-transform duration-200",
              dropdownOpen && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/60 animate-in fade-in-0 zoom-in-95 duration-100">
            {/* User info header */}
            <div className="border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {username || "Pengguna"}
                  </p>
                  <p className="truncate text-xs text-slate-400">{email}</p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-1.5">
              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                </div>
                <span className="font-medium">Profil & Keamanan</span>
              </Link>

              <div className="my-1 h-px bg-slate-100" />

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setShowConfirm(true);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50">
                  <LogOut className="h-3.5 w-3.5 text-red-500" />
                </div>
                <span className="font-medium">Keluar</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {confirmModal}
    </>
  );
}
