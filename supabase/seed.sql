-- Replace this value with an existing Supabase Auth user id.
do $$
declare
  app_user uuid := 'YOUR_AUTH_USER_ID';
  cash_account uuid;
  bca_account uuid;
begin
  insert into accounts (user_id, name, balance)
  values
    (app_user, 'Cash', 750000),
    (app_user, 'BCA', 12500000),
    (app_user, 'OVO', 350000)
  returning id into cash_account;

  select id into bca_account from accounts where user_id = app_user and name = 'BCA' limit 1;

  insert into budgets (user_id, category, monthly_limit)
  values
    (app_user, 'Food', 2500000),
    (app_user, 'Transport', 1200000),
    (app_user, 'Bills', 1800000),
    (app_user, 'Entertainment', 900000)
  on conflict (user_id, category) do update set monthly_limit = excluded.monthly_limit;

  insert into transactions (user_id, account_id, date, description, category, type, amount)
  values
    (app_user, bca_account, date_trunc('month', current_date)::date + 1, 'Monthly salary', 'Salary', 'income', 18500000),
    (app_user, cash_account, date_trunc('month', current_date)::date + 2, 'Coffee and lunch', 'Food', 'expense', 185000),
    (app_user, cash_account, date_trunc('month', current_date)::date + 4, 'Ride hailing', 'Transport', 'expense', 96000),
    (app_user, bca_account, date_trunc('month', current_date)::date + 7, 'Electricity bill', 'Bills', 'expense', 640000),
    (app_user, cash_account, date_trunc('month', current_date)::date + 9, 'Weekend cinema', 'Entertainment', 'expense', 210000);
end $$;
