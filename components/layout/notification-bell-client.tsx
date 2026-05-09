"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, AlertCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationType = {
  id: string;
  title: string;
  message: string;
  type: "warning" | "danger";
};

export function NotificationBellClient({ notifications }: { notifications: NotificationType[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load seen notifications from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("fintrack_seen_notifications");
      if (stored) {
        setSeenIds(JSON.parse(stored));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Mark all current notifications as seen when dropdown is opened
  useEffect(() => {
    if (isOpen && notifications.length > 0) {
      const currentIds = notifications.map(n => n.id);
      const newSeenIds = Array.from(new Set([...seenIds, ...currentIds]));
      
      setSeenIds(newSeenIds);
      try {
        localStorage.setItem("fintrack_seen_notifications", JSON.stringify(newSeenIds));
      } catch (e) {
        // ignore
      }
    }
  }, [isOpen, notifications, seenIds]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [isOpen]);

  const hasUnseenDanger = notifications.some((n) => n.type === "danger" && !seenIds.includes(n.id));
  const hasUnseenWarning = notifications.some((n) => n.type === "warning" && !seenIds.includes(n.id));

  const badgeColor = hasUnseenDanger ? "bg-red-500" : hasUnseenWarning ? "bg-amber-500" : null;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex h-[38px] w-[38px] items-center justify-center rounded-2xl border transition-all",
          isOpen
            ? "border-blue-200 bg-blue-50 text-blue-600 shadow-sm"
            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
        )}
        aria-label="Notifikasi"
      >
        <Bell className="h-5 w-5" />
        {badgeColor && (
          <span className={cn("absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white", badgeColor)} />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/60 animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Notifikasi Anggaran</h3>
            {notifications.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {notifications.length}
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                   <span className="text-lg">🎉</span>
                </div>
                Semua anggaran dalam batas aman!
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      "flex items-start gap-3 rounded-xl p-3 transition-colors",
                      notif.type === "danger" ? "bg-red-50/50 hover:bg-red-50" : "bg-amber-50/50 hover:bg-amber-50"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        notif.type === "danger" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                      )}
                    >
                      {notif.type === "danger" ? <AlertCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4
                        className={cn(
                          "text-sm font-semibold",
                          notif.type === "danger" ? "text-red-900" : "text-amber-900"
                        )}
                      >
                        {notif.title}
                      </h4>
                      <p
                        className={cn(
                          "mt-0.5 text-xs leading-relaxed",
                          notif.type === "danger" ? "text-red-700" : "text-amber-700"
                        )}
                      >
                        {notif.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
