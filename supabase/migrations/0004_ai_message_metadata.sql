-- ════════════════════════════════════════════════════════════════════════
-- 0004_ai_message_metadata
-- Adds per-message UI metadata to ai_messages so the Ask page can persist
-- thumbs-up/down and the "Save answer" bookmark across reloads.
--
-- Without these columns the AskClient's optimistic toggles get reset on
-- refresh and the listThreads SELECT used to fail silently (it queried
-- helpful/saved which didn't exist, returning nothing).
--
-- Safe to re-run: ADD COLUMN IF NOT EXISTS is idempotent.
-- ════════════════════════════════════════════════════════════════════════

alter table public.ai_messages
  add column if not exists helpful boolean,
  add column if not exists saved   boolean not null default false;

-- Helpful when the user lands on the Ask page with many threads — we
-- frequently filter messages by thread + user, and occasionally show a
-- "Saved answers" section across all threads.
create index if not exists ai_messages_user_saved_idx
  on public.ai_messages (user_id)
  where saved = true;
