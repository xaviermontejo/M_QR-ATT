# QR-ATT Admin Setup

1. Back up or review the existing Supabase policies before applying the migration.
2. Open **Supabase Dashboard → SQL Editor** and run `migrations/202610220001_admin_role_and_read_policies.sql`.
3. Create the intended administrator account through the existing sign-up flow first.
4. In the SQL Editor, promote only that specific account by running the following statement with its exact registered email:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```

Replace `admin@example.com` with the intended account's email. Verify the affected row count is exactly one before proceeding. This SQL Editor operation is intentionally separate from the mobile app; the app does not provide a self-service Admin promotion flow.

The migration grants administrators read access to profiles and attendance records through RLS. It does not grant write access to attendance records or modify existing event and attendance data.
