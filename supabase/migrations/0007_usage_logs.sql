-- ════════════════════════════════════════════════════════════════════════
-- 0007_usage_logs
-- One row per metered action, written *after* the action succeeds so failed
-- calls never count toward a user's quota. lib/checkLimit.ts is the
-- single read/write point.
--
-- action_type vocabulary:
--   'ai_question'      — one POST to /api/ask
--   'mock_interview'   — one /api/mock-interview/start (session-level)
--   'document_review'  — one /api/documents/check
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.usage_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  action_type  text not null check (action_type in ('ai_question', 'mock_interview', 'document_review')),
  created_at   timestamptz not null default now()
);

-- Per-user, per-type windowed counts are the hot read path.
create index if not exists usage_logs_user_action_time_idx
  on public.usage_logs (user_id, action_type, created_at desc);

alter table public.usage_logs enable row level security;

drop policy if exists usage_logs_read_own on public.usage_logs;
create policy usage_logs_read_own on public.usage_logs
  for select using (auth.uid() = user_id);

drop policy if exists usage_logs_insert_own on public.usage_logs;
create policy usage_logs_insert_own on public.usage_logs
  for insert with check (auth.uid() = user_id);

revoke update, delete on public.usage_logs from anon, authenticated;
