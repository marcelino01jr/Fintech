import { redirect } from "next/navigation";

// OTP flow sudah diganti dengan magic link
export default function VerifyOtpPage() {
  redirect("/forgot-password");
}
