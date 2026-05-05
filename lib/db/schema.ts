import {
  pgTable,
  uuid,
  text,
  numeric,
  date,
  timestamp,
  pgEnum,
  unique,
  index,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const transactionTypeEnum = pgEnum("transaction_type", ["income", "expense"]);

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  sessionVersion: text("session_version").notNull().default("1"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Reset Tokens (magic link for password reset) ────────────────────────────

export const resetTokens = pgTable("reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Accounts ─────────────────────────────────────────────────────────────────

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  balance: numeric("balance").notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Transactions ─────────────────────────────────────────────────────────────

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: uuid("account_id").references(() => accounts.id, { onDelete: "set null" }),
    date: date("date").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    type: transactionTypeEnum("type").notNull(),
    amount: numeric("amount").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userDateIdx: index("transactions_user_date_idx").on(t.userId, t.date),
    userCategoryIdx: index("transactions_user_category_idx").on(t.userId, t.category),
  })
);

// ─── Budgets ──────────────────────────────────────────────────────────────────

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    category: text("category").notNull(),
    monthlyLimit: numeric("monthly_limit").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userCategoryUnique: unique("budgets_user_category_unique").on(t.userId, t.category),
  })
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
