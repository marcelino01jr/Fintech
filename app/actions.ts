"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, auth } from "@/lib/auth";
import { db, users, transactions, budgets, resetTokens } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  if (typeof entry === "string") return entry.trim();
  return "";
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function signIn(formData: FormData) {
  const email = value(formData, "email");
  const password = value(formData, "password");

  if (!email || !password) {
    redirect("/login?message=" + encodeURIComponent("Email dan kata sandi wajib diisi."));
  }

  try {
    await nextAuthSignIn("credentials", { email, password, redirect: false });
  } catch {
    redirect("/login?message=" + encodeURIComponent("Email atau kata sandi salah."));
  }

  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const username = value(formData, "username");
  const email = value(formData, "email").toLowerCase();
  const password = value(formData, "password");

  if (!username || username.length < 3) {
    redirect("/register?message=" + encodeURIComponent("Username minimal 3 karakter."));
  }
  if (!email || !password) {
    redirect("/register?message=" + encodeURIComponent("Email dan kata sandi wajib diisi."));
  }
  if (password.length < 6) {
    redirect("/register?message=" + encodeURIComponent("Kata sandi minimal 6 karakter."));
  }

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    redirect("/register?message=" + encodeURIComponent("Email sudah terdaftar."));
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.insert(users).values({ id: randomUUID(), username, email, passwordHash });

  redirect("/login?message=" + encodeURIComponent("Akun berhasil dibuat! Silakan masuk."));
}

export async function signOut() {
  await nextAuthSignOut({ redirect: false });
  redirect("/login");
}

// ─── Password Reset (magic link) ─────────────────────────────────────────────

export async function requestPasswordReset(formData: FormData) {
  const email = value(formData, "email").toLowerCase();

  if (!email) {
    redirect("/forgot-password?message=" + encodeURIComponent("Masukkan alamat email Anda."));
  }

  // Always show success page — don't reveal if email exists (security)
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (user) {
    // Delete any existing reset tokens for this user
    await db.delete(resetTokens).where(eq(resetTokens.userId, user.id));

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.insert(resetTokens).values({
      id: randomUUID(),
      userId: user.id,
      token,
      expiresAt,
    });

    const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const resetUrl = `${siteUrl}/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail(email, resetUrl);
    } catch (err) {
      console.error("[Reset] Failed to send email:", err);
      redirect("/forgot-password?message=" + encodeURIComponent("Gagal mengirim email. Coba lagi."));
    }
  }

  // Always redirect to success page
  redirect("/forgot-password?sent=1");
}

export async function resetPassword(formData: FormData) {
  const token = value(formData, "token");
  const newPassword = value(formData, "new_password");
  const confirmPassword = value(formData, "confirm_password");

  if (!token) {
    redirect("/forgot-password?message=" + encodeURIComponent("Link tidak valid. Minta link baru."));
  }
  if (newPassword.length < 6) {
    redirect(`/reset-password?token=${token}&message=` + encodeURIComponent("Kata sandi minimal 6 karakter."));
  }
  if (newPassword !== confirmPassword) {
    redirect(`/reset-password?token=${token}&message=` + encodeURIComponent("Konfirmasi kata sandi tidak cocok."));
  }

  // Verify token
  const [record] = await db
    .select()
    .from(resetTokens)
    .where(eq(resetTokens.token, token))
    .limit(1);

  if (!record) {
    redirect("/forgot-password?message=" + encodeURIComponent("Link tidak valid atau sudah digunakan."));
  }

  if (new Date() > record.expiresAt) {
    await db.delete(resetTokens).where(eq(resetTokens.id, record.id));
    redirect("/forgot-password?message=" + encodeURIComponent("Link sudah kedaluwarsa. Minta link baru."));
  }

  // Update password
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db.update(users).set({ passwordHash }).where(eq(users.id, record.userId));

  // Delete used token
  await db.delete(resetTokens).where(eq(resetTokens.id, record.id));

  redirect("/login?message=" + encodeURIComponent("Kata sandi berhasil diperbarui! Silakan masuk."));
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function updatePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const newPassword = value(formData, "new_password");
  const confirmPassword = value(formData, "confirm_password");

  if (newPassword.length < 6) {
    redirect("/profile?message=" + encodeURIComponent("Kata sandi minimal 6 karakter."));
  }
  if (newPassword !== confirmPassword) {
    redirect("/profile?message=" + encodeURIComponent("Konfirmasi kata sandi tidak cocok."));
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db.update(users).set({ passwordHash }).where(eq(users.id, session.user.id));

  redirect("/profile?success=" + encodeURIComponent("Kata sandi berhasil diperbarui!"));
}

// ─── OTP Verification (deprecated - now using magic link) ─────────────────────

export async function verifyOtpAction(email: string, token: string) {
  // OTP flow has been replaced with magic link
  // This function is kept for compatibility but always returns error
  return {
    success: false,
    message: "OTP verification is no longer supported. Please use password reset link.",
  };
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function saveTransaction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const id = value(formData, "id");
  const rawCategory = value(formData, "category");
  const customCategory = value(formData, "custom_category");
  const category = rawCategory === "Lainnya" && customCategory ? customCategory : rawCategory;

  const payload = {
    userId: session.user.id,
    date: value(formData, "date"),
    description: value(formData, "description"),
    category,
    type: value(formData, "type") as "income" | "expense",
    amount: value(formData, "amount"),
  };

  if (id) {
    await db
      .update(transactions)
      .set(payload)
      .where(and(eq(transactions.id, id), eq(transactions.userId, session.user.id)));
  } else {
    await db.insert(transactions).values({ id: randomUUID(), ...payload });
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/budgets");
  redirect(`/transactions?saved=${Date.now()}`);
}

export async function deleteTransaction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const id = value(formData, "id");
  await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, session.user.id)));

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/budgets");
  redirect("/transactions");
}

export async function deleteTransactionById(id: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, session.user.id)));

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/budgets");
}

// ─── Budgets ──────────────────────────────────────────────────────────────────

export async function saveBudget(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const id = value(formData, "id");
  const rawCategory = value(formData, "category");
  const customCategory = value(formData, "custom_category");
  const category = rawCategory === "Lainnya" && customCategory ? customCategory : rawCategory;

  const payload = {
    userId: session.user.id,
    category,
    monthlyLimit: value(formData, "monthly_limit"),
  };

  if (id) {
    await db
      .update(budgets)
      .set(payload)
      .where(and(eq(budgets.id, id), eq(budgets.userId, session.user.id)));
  } else {
    await db
      .insert(budgets)
      .values({ id: randomUUID(), ...payload })
      .onConflictDoUpdate({
        target: [budgets.userId, budgets.category],
        set: { monthlyLimit: payload.monthlyLimit },
      });
  }

  revalidatePath("/budgets");
  redirect(`/budgets?saved=${Date.now()}`);
}

export async function deleteBudget(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await db
    .delete(budgets)
    .where(and(eq(budgets.id, value(formData, "id")), eq(budgets.userId, session.user.id)));

  revalidatePath("/budgets");
  redirect("/budgets");
}

export async function deleteBudgetById(id: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await db
    .delete(budgets)
    .where(and(eq(budgets.id, id), eq(budgets.userId, session.user.id)));

  revalidatePath("/budgets");
}
