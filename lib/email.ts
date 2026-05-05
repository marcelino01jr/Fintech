import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "FinTrack <onboarding@resend.dev>",
    to: email,
    subject: "Reset Kata Sandi - FinTrack",
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
          <p style="margin: 0 0 24px; font-size: 14px; color: #64748b; line-height: 1.6;">
            Kami menerima permintaan untuk mereset kata sandi akun FinTrack Anda.
            Klik tombol di bawah untuk membuat kata sandi baru. Link berlaku selama <strong>1 jam</strong>.
          </p>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}"
              style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 12px rgba(59,130,246,0.3);">
              Reset Kata Sandi
            </a>
          </div>

          <p style="margin: 24px 0 0; font-size: 13px; color: #94a3b8; text-align: center; line-height: 1.5;">
            Atau copy link ini ke browser:<br/>
            <span style="color: #64748b; word-break: break-all; font-size: 12px;">${resetUrl}</span>
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />

          <p style="margin: 0; font-size: 13px; color: #94a3b8; text-align: center;">
            Jika Anda tidak meminta reset kata sandi, abaikan email ini. Akun Anda tetap aman.
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
