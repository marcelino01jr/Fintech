"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { verifyOtpAction } from "@/app/actions";
import { Loader2 } from "lucide-react";

export function OtpForm({ email, message }: { email: string; message?: string }) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState(message || "");
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const handleChange = useCallback(
    (index: number, value: string) => {
      const digit = value.replace(/\D/g, "").slice(-1);
      const newOtp = [...otp];
      newOtp[index] = digit;
      setOtp(newOtp);
      setError("");

      if (digit && index < 5) {
        inputsRef.current[index + 1]?.focus();
      }

      if (digit && index === 5 && newOtp.every((d) => d !== "")) {
        verifyOtp(newOtp.join(""));
      }
    },
    [otp]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newOtp = Array(6).fill("");
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    setError("");

    const focusIndex = Math.min(pasted.length, 5);
    inputsRef.current[focusIndex]?.focus();

    if (pasted.length === 6) {
      verifyOtp(pasted);
    }
  }, []);

  async function verifyOtp(token: string) {
    setLoading(true);
    setError("");

    try {
      const result = await verifyOtpAction(email, token);

      if (!result.success) {
        setError(result.message);
        setLoading(false);
        return;
      }

      router.push("/reset-password?email=" + encodeURIComponent(email));
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  }

  const allFilled = otp.every((d) => d !== "");

  return (
    <div className="space-y-5">
      <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputsRef.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`h-14 w-11 rounded-2xl border text-center text-xl font-bold transition-all sm:h-16 sm:w-14 sm:text-2xl ${
              digit
                ? "border-blue-300 bg-blue-50/50 text-slate-900"
                : "border-slate-200 bg-slate-50/50 text-slate-400"
            } focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            aria-label={`Digit ${i + 1}`}
            disabled={loading}
          />
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        onClick={() => verifyOtp(otp.join(""))}
        disabled={!allFilled || loading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Memverifikasi...
          </>
        ) : (
          "Verifikasi Kode"
        )}
      </button>
    </div>
  );
}
