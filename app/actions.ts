"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  if (typeof entry === "string") return entry.trim();
  return "";
}

// ─── Auth ────────────────────────────────────────────────────────────

export async function signIn(formData: FormData) {
  const supabase = createClient();
  const email = value(formData, "email");
  const password = value(formData, "password");

  if (!email || !password) {
    redirect("/login?message=" + encodeURIComponent("Email dan kata sandi wajib diisi."));
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const msg = error.message.toLowerCase().includes("invalid login")
      ? "Email atau kata sandi salah."
      : error.message;
    redirect(`/login?message=${encodeURIComponent(msg)}`);
  }

  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const supabase = createClient();
  const username = value(formData, "username");
  const email = value(formData, "email");
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

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });

  if (error) {
    const msg = error.message.toLowerCase().includes("rate limit")
      ? "Terlalu banyak percobaan. Silakan tunggu beberapa menit."
      : error.message;
    redirect(`/register?message=${encodeURIComponent(msg)}`);
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ─── Password Reset (OTP flow) ──────────────────────────────────────

export async function requestPasswordReset(formData: FormData) {
  const supabase = createClient();
  const email = value(formData, "email");

  if (!email) {
    redirect("/forgot-password?message=" + encodeURIComponent("Masukkan alamat email Anda."));
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) {
    const msg = error.message.toLowerCase().includes("rate limit")
      ? "Terlalu banyak percobaan. Silakan tunggu beberapa menit."
      : error.message.toLowerCase().includes("signups not allowed")
        ? "Email tidak terdaftar."
        : error.message;
    redirect("/forgot-password?message=" + encodeURIComponent(msg));
  }

  redirect("/verify-otp?email=" + encodeURIComponent(email));
}

export async function resetPassword(formData: FormData) {
  const supabase = createClient();

  // Verify user is authenticated (via OTP)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/forgot-password?message=" + encodeURIComponent("Sesi tidak valid. Silakan minta kode OTP baru."));
  }

  const newPassword = value(formData, "new_password");
  const confirmPassword = value(formData, "confirm_password");

  if (newPassword.length < 6) {
    redirect("/reset-password?message=" + encodeURIComponent("Kata sandi minimal 6 karakter."));
  }

  if (newPassword !== confirmPassword) {
    redirect("/reset-password?message=" + encodeURIComponent("Konfirmasi kata sandi tidak cocok."));
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    redirect("/reset-password?message=" + encodeURIComponent(error.message));
  }

  await supabase.auth.signOut();
  redirect("/login?message=" + encodeURIComponent("Kata sandi berhasil diperbarui! Silakan masuk."));
}

// ─── Profile ─────────────────────────────────────────────────────────

export async function updatePassword(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const newPassword = value(formData, "new_password");
  const confirmPassword = value(formData, "confirm_password");

  if (newPassword.length < 6) {
    redirect("/profile?message=" + encodeURIComponent("Kata sandi minimal 6 karakter."));
  }

  if (newPassword !== confirmPassword) {
    redirect("/profile?message=" + encodeURIComponent("Konfirmasi kata sandi tidak cocok."));
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    redirect("/profile?message=" + encodeURIComponent(error.message));
  }

  redirect("/profile?success=" + encodeURIComponent("Kata sandi berhasil diperbarui!"));
}

// ─── Transactions ────────────────────────────────────────────────────

export async function saveTransaction(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = value(formData, "id");
  const rawCategory = value(formData, "category");
  const customCategory = value(formData, "custom_category");
  const category = rawCategory === "Lainnya" && customCategory ? customCategory : rawCategory;

  const payload = {
    user_id: user.id,
    date: value(formData, "date"),
    description: value(formData, "description"),
    category,
    type: value(formData, "type"),
    amount: Number(value(formData, "amount")),
  };

  if (id) {
    await supabase.from("transactions").update(payload).eq("id", id).eq("user_id", user.id);
  } else {
    await supabase.from("transactions").insert(payload);
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/budgets");
  redirect(`/transactions?saved=${Date.now()}`);
}

export async function deleteTransaction(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = value(formData, "id");
  await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/budgets");
  redirect("/transactions");
}

// ─── Budgets ─────────────────────────────────────────────────────────

export async function saveBudget(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = value(formData, "id");
  const rawCategory = value(formData, "category");
  const customCategory = value(formData, "custom_category");
  const category = rawCategory === "Lainnya" && customCategory ? customCategory : rawCategory;
  const payload = {
    user_id: user.id,
    category,
    monthly_limit: Number(value(formData, "monthly_limit")),
  };

  if (id) {
    await supabase.from("budgets").update(payload).eq("id", id).eq("user_id", user.id);
  } else {
    await supabase.from("budgets").upsert(payload, { onConflict: "user_id,category" });
  }

  revalidatePath("/budgets");
  redirect(`/budgets?saved=${Date.now()}`);
}

export async function deleteBudget(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("budgets").delete().eq("id", value(formData, "id")).eq("user_id", user.id);
  revalidatePath("/budgets");
  redirect("/budgets");
}
