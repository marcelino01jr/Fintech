import { pgTable, text, numeric, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  date: text("date").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  type: text("type").notNull(),
  amount: numeric("amount").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const budgets = pgTable("budgets", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  category: text("category").notNull(),
  monthly_limit: numeric("monthly_limit").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    userCategoryUnique: uniqueIndex("user_category_idx").on(table.user_id, table.category),
  };
});
