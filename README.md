# Personal Finance Tracker

A full-stack finance tracker built with Next.js 14 App Router, Supabase Auth/PostgreSQL, TailwindCSS, Shadcn-style components, and Recharts.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project and copy `.env.example` to `.env.local`.

3. Run the SQL in `supabase/schema.sql` in the Supabase SQL editor.

4. Optional: sign up in the app, copy your auth user id, replace `YOUR_AUTH_USER_ID` in `supabase/seed.sql`, then run it.

5. Start the app:

```bash
npm run dev
```

## Folder Structure

```txt
app/
  (auth)/login, register
  (dashboard)/dashboard, transactions, budgets, accounts
  actions.ts
components/
  charts, layout, transactions, ui
lib/
  finance, supabase, utils
supabase/
  schema.sql, seed.sql
```

## Supabase Tables

- `transactions`: dated income and expenses by category/account
- `budgets`: monthly budget limits by category
- `accounts`: named balances such as Cash, BCA, OVO

Row-level security is enabled so each authenticated user can only access their own finance data.
