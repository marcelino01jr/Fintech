"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, and, gte, lte, count, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, auth } from "@/lib/auth";
import { db, users, transactions, budgets, otpTokens } from "@/lib/db";
import { sendOtpEmail } from "@/lib/email";

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  if (typeof entry === "string") return entry.trim();
  return "";
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function signIn(formData: FormData) {
  const email = value(formData, "email");
  const password = value(formData, "password");

  if (!email || !password) {
    redirect("/login?message=" + encodeURIComponent("Email dan kata sandi wajib diisi."));
  }

  try {
    await nextAuthSignIn("credentials", {
      email,
      password,
      redirect: false,
    });
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

  // Check if email already exists
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    redirect("/register?message=" + encodeURIComponent("Email sudah terdaftar."));
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.insert(users).values({ username, email, passwordHash });

  // Auto sign in after register
  try {
    await nextAuthSignIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch {
    redirect("/login?message=" + encodeURIComponent("Akun berhasil dibuat. Silakan masuk."));
  }

  redirect("/dashboard");
}

export async function signOut() {
  await nextAuthSignOut({ redirect: false });
  redirect("/login");
}

// ─── Password Reset (OTP flow) ───────────────────────────────────────────────

export async function requestPasswordReset(formData: FormData) {
  const email = value(formData, "email").toLowerCase();

  if (!email) {
    redirect("/forgot-password?message=" + encodeURIComponent("Masukkan alamat email Anda."));
  }

  // Check user exists (don't reveal if not found for security)
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (user) {
    // Delete any existing OTP for this email
    await db.delete(otpTokens).where(eq(otpTokens.email, email));

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.insert(otpTokens).values({
      email,
      token: otp,
      expiresAt,
    });

    try {
      await sendOtpEmail(email, otp);
    } catch {
      redirect("/forgot-password?message=" + encodeURIComponent("Gagal mengirim email. Coba lagi."));
    }
  }

  // Always redirect to verify-otp (don't reveal if email exists)
  redirect("/verify-otp?email=" + encodeURIComponent(email));
}

export async function verifyOtpAction(email: string, token: string): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  const [otpRecord] = await db
    .select()
    .from(otpTokens)
    .where(
      and(
        eq(otpTokens.email, normalizedEmail),
        eq(otpTokens.token, token),
        eq(otpTokens.used, "false")
      )
    )
    .limit(1);

  if (!otpRecord) {
    return { success: false, message: "Kode OTP tidak valid atau sudah kedaluwarsa." };
  }

  if (new Date() > otpRecord.expiresAt) {
    await db.delete(otpTokens).where(eq(otpTokens.id, otpRecord.id));
    return { success: false, message: "Kode OTP sudah kedaluwarsa. Minta kode baru." };
  }

  // Mark as used
  await db.update(otpTokens).set({ used: "true" }).where(eq(otpTokens.id, otpRecord.id));

  return { success: true, message: "OTP valid." };
}

export async function resetPassword(formData: FormData) {
  const email = value(formData, "email").toLowerCase();
  const newPassword = value(formData, "new_password");
  const confirmPassword = value(formData, "confirm_password");

  if (newPassword.length < 6) {
    redirect("/reset-password?email=" + encodeURIComponent(email) + "&message=" + encodeURIComponent("Kata sandi minimal 6 karakter."));
  }
  if (newPassword !== confirmPassword) {
    redirect("/reset-password?email=" + encodeURIComponent(email) + "&message=" + encodeURIComponent("Konfirmasi kata sandi tidak cocok."));
  }

  // Verify there's a used (verified) OTP for this email
  const [otpRecord] = await db
    .select()
    .from(otpTokens)
    .where(and(eq(otpTokens.email, email), eq(otpTokens.used, "true")))
    .limit(1);

  if (!otpRecord) {
    redirect("/forgot-password?message=" + encodeURIComponent("Sesi tidak valid. Silakan minta kode OTP baru."));
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db.update(users).set({ passwordHash }).where(eq(users.email, email));

  // Clean up OTP
  await db.delete(otpTokens).where(eq(otpTokens.email, email));

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
    await db.insert(transactions).values(payload);
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
      .values(payload)
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
    .where(
      and(eq(budgets.id, value(formData, "id")), eq(budgets.userId, session.user.id))
    );

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
