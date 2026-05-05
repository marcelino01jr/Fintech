"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const startLoading = useCallback(() => {
    setLoading(true);
    setVisible(true);
    setProgress(10);
  }, []);

  const stopLoading = useCallback(() => {
    setProgress(100);
    setTimeout(() => {
      setLoading(false);
      setTimeout(() => setVisible(false), 200);
    }, 300);
  }, []);

  // Detect route changes via pathname/searchParams changes
  useEffect(() => {
    stopLoading();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // Animate progress bar while loading
  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 85) return p;
        const increment = p < 30 ? 8 : p < 60 ? 5 : 2;
        return Math.min(p + increment, 85);
      });
    }, 200);
    return () => clearInterval(timer);
  }, [loading]);

  // Listen for link clicks to start progress
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto")) return;
      startLoading();
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [startLoading]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        height: "3px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: "linear-gradient(90deg, #3b82f6, #6366f1)",
          borderRadius: "0 2px 2px 0",
          boxShadow: "0 0 8px rgba(99,102,241,0.6)",
          transition: progress === 100
            ? "width 0.3s ease-out, opacity 0.2s ease"
            : "width 0.4s ease",
          opacity: loading ? 1 : 0,
        }}
      />
    </div>
  );
}
