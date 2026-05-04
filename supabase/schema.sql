create extension if not exists "pgcrypto";

create type transaction_type as enum ('income', 'expense');

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  balance numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references accounts(id) on delete set null,
  date date not null,
  description text not null,
  category text not null,
  type transaction_type not null,
  amount numeric not null check (amount >= 0),
  created_at timestamptz not null default now()
);

create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  monthly_limit numeric not null check (monthly_limit >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, category)
);

alter table accounts enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;

create policy "Users manage own accounts"
on accounts for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage own transactions"
on transactions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage own budgets"
on budgets for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists transactions_user_date_idx on transactions(user_id, date desc);
create index if not exists transactions_user_category_idx on transactions(user_id, category);
