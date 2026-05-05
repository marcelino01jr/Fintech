import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(email: string, otp: string) {
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "FinTrack <noreply@yourdomain.com>",
    to: email,
    subject: "Kode OTP Reset Kata Sandi - FinTrack",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f8fafc; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 16px; margin-bottom: 12px;">
            <span style="font-size: 24px;">💰</span>
          </div>
          <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #0f172a;">FinTrack</h1>
        </div>

        <div style="background: white; border-radius: 16px; padding: 28px; border: 1px solid #e2e8f0;">
          <h2 style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #0f172a;">Reset Kata Sandi</h2>
          <p style="margin: 0 0 24px; font-size: 14px; color: #64748b;">
            Gunakan kode OTP berikut untuk mereset kata sandi Anda. Kode berlaku selama <strong>10 menit</strong>.
          </p>

          <div style="text-align: center; margin: 24px 0;">
            <div style="display: inline-block; background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 16px 32px;">
              <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1e40af; font-family: monospace;">${otp}</span>
            </div>
          </div>

          <p style="margin: 24px 0 0; font-size: 13px; color: #94a3b8; text-align: center;">
            Jika Anda tidak meminta reset kata sandi, abaikan email ini.
          </p>
        </div>

        <p style="margin: 16px 0 0; font-size: 12px; color: #94a3b8; text-align: center;">
          © ${new Date().getFullYear()} FinTrack. Semua hak dilindungi.
        </p>
      </div>
    `,
  });

  if (error) throw new Error(error.message);
}
