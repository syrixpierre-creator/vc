-- 0003: columns and tables the application layer needs (sessions, challenges, events, pending OAuth).
-- NOTE: written to be applied with psql after 0002; not yet executed against a live database.
BEGIN;

ALTER TABLE sessions ADD COLUMN last_seen_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE user_settings ADD COLUMN leaderboard_opt_in boolean NOT NULL DEFAULT false;
-- pseudonyms: case-insensitive uniqueness and a safe format (no spaces, no '@')
CREATE UNIQUE INDEX users_pseudonym_ci_uq ON users (lower(pseudonym)) WHERE pseudonym IS NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_pseudonym_format CHECK (pseudonym IS NULL OR pseudonym ~ '^[A-Za-z0-9_-]{3,24}$');

ALTER TABLE challenge_participation ADD COLUMN completed_at timestamptz;
ALTER TABLE challenge_participation ADD COLUMN claimed_at timestamptz;
ALTER TABLE challenge_participation ADD COLUMN awarded_cents int NOT NULL DEFAULT 0 CHECK (awarded_cents >= 0);

-- Verified server-side events that drive challenge progress. (user_id, event_key) makes replays harmless.
CREATE TABLE user_events (
  id         bigserial PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       text NOT NULL CHECK (type IN ('qualified_referrals','active_days','verified_operations','challenges_completed')),
  at         timestamptz NOT NULL,
  event_key  text NOT NULL,
  UNIQUE (user_id, event_key)
);
CREATE INDEX user_events_user_type_idx ON user_events (user_id, type, at);
CREATE INDEX user_xp_ledger_created_idx ON user_xp_ledger (created_at);

ALTER TABLE reward_claims ADD COLUMN kind text;

-- OAuth login attempts: single use, short lived (the app deletes on read and checks expiry).
CREATE TABLE oauth_pending (
  state          text PRIMARY KEY,
  nonce          text NOT NULL,
  code_verifier  text NOT NULL,
  next_path      text NOT NULL,
  ref_code       text,
  expires_at     timestamptz NOT NULL
);
CREATE INDEX oauth_pending_expiry_idx ON oauth_pending (expires_at);

INSERT INTO schema_migrations (version) VALUES ('0003_challenges_sessions_pending');
COMMIT;
