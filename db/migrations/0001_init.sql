-- SYRIX VCF — initial schema (PostgreSQL 16)
-- Money is integer cents. Balances are derived from reward_ledger, never stored.
-- NOTE: written to be applied with psql; not yet executed against a live database.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE schema_migrations (
  version     text PRIMARY KEY,
  applied_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------- identity ----------
CREATE TABLE users (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name   text NOT NULL,
  email          citext NOT NULL,                       -- attribute, not the identity
  country_code   char(2),
  dial_code      text,
  language       text NOT NULL DEFAULT 'en' CHECK (language IN ('en','fr','pt','es','ar')),
  time_zone      text,
  pseudonym      text UNIQUE,
  status         text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','pending_deletion','deleted')),
  review_status  text NOT NULL DEFAULT 'none' CHECK (review_status IN ('none','flagged','under_review','cleared')),
  onboarded_at   timestamptz,
  last_seen_at   timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX users_email_idx ON users (email);

CREATE TABLE user_settings (
  user_id               uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  auto_sync             boolean NOT NULL DEFAULT false,
  sync_paused           boolean NOT NULL DEFAULT false,
  notify_email_marketing boolean NOT NULL DEFAULT false,
  notify_reminders      boolean NOT NULL DEFAULT false,
  profile_public        boolean NOT NULL DEFAULT false,
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- Google OpenID subject is the stable external id. Tokens are stored encrypted (AES-256-GCM envelope).
CREATE TABLE oauth_accounts (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider           text NOT NULL CHECK (provider = 'google'),
  provider_subject   text NOT NULL,
  contacts_scope     boolean NOT NULL DEFAULT false,
  contacts_status    text NOT NULL DEFAULT 'not_connected'
                     CHECK (contacts_status IN ('not_connected','connected','revoked','refresh_failed','reconnect_requested')),
  refresh_token_enc  text,
  access_token_enc   text,
  access_expires_at  timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_subject),
  UNIQUE (user_id, provider)
);

CREATE TABLE sessions (
  id_hash      bytea PRIMARY KEY,                       -- sha256 of the cookie value; raw id is never stored
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  rotated_at   timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL,
  revoked_at   timestamptz,
  user_agent   text,
  ip_prefix    text                                      -- truncated, not the full address
);
CREATE INDEX sessions_user_idx ON sessions (user_id) WHERE revoked_at IS NULL;

-- ---------- contacts (one phone number per contact) ----------
CREATE TABLE contacts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name     text NOT NULL CHECK (length(full_name) BETWEEN 1 AND 200),
  phone_e164    text CHECK (phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  emails        text[] NOT NULL DEFAULT '{}',
  organization  text,
  job_title     text,
  notes         text,
  google_resource_name text,                             -- e.g. people/c123, kept apart from app data
  google_etag   text,
  sync_state    text NOT NULL DEFAULT 'local_only'
                CHECK (sync_state IN ('local_only','pending','synced','failed','conflict','paused')),
  deleted_at    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
-- duplicate prevention: same number twice for the same user is refused (soft-deleted rows excluded)
CREATE UNIQUE INDEX contacts_user_phone_uq ON contacts (user_id, phone_e164) WHERE phone_e164 IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX contacts_user_name_idx ON contacts (user_id, lower(full_name));
CREATE INDEX contacts_user_sync_idx ON contacts (user_id, sync_state);

CREATE TABLE contact_labels (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        text NOT NULL CHECK (length(name) BETWEEN 1 AND 60),
  UNIQUE (user_id, name)
);
CREATE TABLE contact_label_links (
  contact_id  uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  label_id    uuid NOT NULL REFERENCES contact_labels(id) ON DELETE CASCADE,
  PRIMARY KEY (contact_id, label_id)
);

CREATE TABLE contact_sync_jobs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_id      uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  operation       text NOT NULL CHECK (operation IN ('create','update')),   -- no silent remote delete
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','succeeded','failed','dead')),
  attempts        int  NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  idempotency_key text NOT NULL UNIQUE,                  -- contact id + version: no duplicate Google contact
  last_error      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sync_jobs_due_idx ON contact_sync_jobs (status, next_attempt_at);
CREATE TABLE contact_sync_logs (
  id          bigserial PRIMARY KEY,
  job_id      uuid REFERENCES contact_sync_jobs(id) ON DELETE SET NULL,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  outcome     text NOT NULL,
  detail      text,                                      -- never contains contact contents or tokens
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE contact_backups (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_count int NOT NULL,
  payload_enc bytea NOT NULL,                            -- encrypted VCF
  vcard_version text NOT NULL CHECK (vcard_version IN ('2.1','3.0','4.0')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz
);
CREATE TABLE contact_change_history (
  id          bigserial PRIMARY KEY,
  contact_id  uuid NOT NULL,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action      text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------- referrals ----------
CREATE TABLE referral_codes (
  user_id     uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  code        text NOT NULL UNIQUE CHECK (code ~ '^[A-Z0-9]{8,12}$'),
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE referrals (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id    uuid NOT NULL REFERENCES users(id),
  referred_id    uuid NOT NULL UNIQUE REFERENCES users(id),   -- a person can be referred only once
  status         text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','qualified','disqualified','under_review')),
  disqualified_reason text,
  qualified_at   timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  CHECK (referrer_id <> referred_id)                         -- no self-referral
);
CREATE INDEX referrals_referrer_status_idx ON referrals (referrer_id, status);
CREATE TABLE referral_events (
  id          bigserial PRIMARY KEY,
  referral_id uuid REFERENCES referrals(id) ON DELETE CASCADE,
  code        text,
  event       text NOT NULL CHECK (event IN ('click','registered','verified','qualified','disqualified','flagged')),
  ip_hash     bytea,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------- progression ----------
CREATE TABLE vip_levels (
  id          serial PRIMARY KEY,
  name        text NOT NULL UNIQUE,
  min_xp      bigint NOT NULL CHECK (min_xp >= 0),
  benefits    jsonb NOT NULL DEFAULT '{}'
);
CREATE TABLE user_xp_ledger (
  id              bigserial PRIMARY KEY,
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount          int  NOT NULL,
  reason          text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE user_achievements (
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code        text NOT NULL,
  earned_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, code)
);

-- ---------- challenges ----------
CREATE TABLE challenge_definitions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text NOT NULL UNIQUE,
  title           jsonb NOT NULL,                        -- {"en": "...", "fr": "...", ...}
  description     jsonb NOT NULL,
  difficulty      text NOT NULL CHECK (difficulty IN ('advanced','expert','elite','legendary')),
  starts_at       timestamptz NOT NULL,
  ends_at         timestamptz NOT NULL,
  rule            jsonb NOT NULL,                        -- metric + threshold, validated server-side
  reward_type     text NOT NULL CHECK (reward_type IN ('xp','badge','vip','premium','cash','whatsapp_promotion','telegram_stars','telegram_premium')),
  reward_cents    int CHECK (reward_cents IS NULL OR reward_cents > 0),
  reward_xp       int,
  max_winners     int CHECK (max_winners IS NULL OR max_winners > 0),
  budget_cents    int,
  claim_deadline  timestamptz,
  terms           jsonb NOT NULL,
  published       boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at),
  CHECK (reward_type <> 'cash' OR (reward_cents IS NOT NULL AND budget_cents IS NOT NULL))  -- no cash reward without a budget
);
CREATE TABLE challenge_participation (
  challenge_id uuid NOT NULL REFERENCES challenge_definitions(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status       text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','reward_pending','reward_in_progress','reward_delivered','expired','rejected')),
  joined_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (challenge_id, user_id)
);
CREATE TABLE challenge_progress (
  id              bigserial PRIMARY KEY,
  challenge_id    uuid NOT NULL,
  user_id         uuid NOT NULL,
  delta           int NOT NULL CHECK (delta > 0),
  source_event    text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,                  -- replayed events cannot add progress twice
  created_at      timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (challenge_id, user_id) REFERENCES challenge_participation(challenge_id, user_id) ON DELETE CASCADE
);
CREATE TABLE challenge_reward_claims (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL,
  user_id      uuid NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (challenge_id, user_id),                        -- one claim per challenge per user
  FOREIGN KEY (challenge_id, user_id) REFERENCES challenge_participation(challenge_id, user_id)
);

-- ---------- rewards and money ----------
CREATE TABLE reward_definitions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text NOT NULL UNIQUE,
  kind        text NOT NULL CHECK (kind IN ('cash','xp','badge','vip','premium','whatsapp_promotion','telegram_stars','telegram_premium')),
  config      jsonb NOT NULL DEFAULT '{}'
);
CREATE TABLE reward_claims (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id),
  reward_id       uuid REFERENCES reward_definitions(id),
  source          text NOT NULL,                         -- e.g. 'milestone:500', 'challenge:<id>'
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','failed','action_required')),
  idempotency_key text NOT NULL UNIQUE,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Append-only ledger. amount_cents is always positive; the type gives the direction.
CREATE TABLE reward_ledger (
  id              bigserial PRIMARY KEY,
  user_id         uuid NOT NULL REFERENCES users(id),
  type            text NOT NULL CHECK (type IN ('earn','reserve','release','pay','adjustment')),
  amount_cents    bigint NOT NULL CHECK (amount_cents <> 0),
  payout_id       uuid,
  reference       text,
  reason          text,
  actor_id        uuid REFERENCES users(id),             -- admin for adjustments
  idempotency_key text NOT NULL UNIQUE,                  -- replays are rejected by the database
  created_at      timestamptz NOT NULL DEFAULT now(),
  CHECK (type = 'adjustment' OR amount_cents > 0),
  CHECK (type <> 'adjustment' OR (reason IS NOT NULL AND actor_id IS NOT NULL))
);
CREATE INDEX reward_ledger_user_idx ON reward_ledger (user_id);

CREATE FUNCTION reward_ledger_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'this table is append-only'; END $$;
CREATE TRIGGER reward_ledger_no_update BEFORE UPDATE OR DELETE ON reward_ledger
  FOR EACH ROW EXECUTE FUNCTION reward_ledger_immutable();

CREATE VIEW reward_balances AS
SELECT user_id,
  COALESCE(SUM(amount_cents) FILTER (WHERE type = 'earn'), 0)                                          AS earned_cents,
  COALESCE(SUM(CASE type WHEN 'earn' THEN amount_cents WHEN 'release' THEN amount_cents
                         WHEN 'reserve' THEN -amount_cents WHEN 'adjustment' THEN amount_cents ELSE 0 END), 0) AS available_cents,
  COALESCE(SUM(CASE type WHEN 'reserve' THEN amount_cents WHEN 'release' THEN -amount_cents
                         WHEN 'pay' THEN -amount_cents ELSE 0 END), 0)                                 AS reserved_cents,
  COALESCE(SUM(amount_cents) FILTER (WHERE type = 'pay'), 0)                                           AS paid_cents
FROM reward_ledger GROUP BY user_id;

CREATE TABLE payout_methods (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind          text NOT NULL CHECK (kind IN ('paypal','binance_pay','pix')),
  recipient_name text,
  details_enc   text NOT NULL,                           -- AES-256-GCM envelope, bound to this row id
  masked_hint   text NOT NULL,                           -- what admins and logs may display
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);
CREATE TABLE payout_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id),
  amount_cents    bigint NOT NULL CHECK (amount_cents > 0),
  currency        char(3) NOT NULL DEFAULT 'USD' CHECK (currency = 'USD'),
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','action_required','paid','failed','rejected')),
  method_kind     text NOT NULL,
  recipient_snapshot_enc text NOT NULL,                  -- frozen at request time: later profile edits cannot redirect it
  masked_hint     text NOT NULL,
  tx_reference    text,
  admin_notes     text,
  idempotency_key text NOT NULL UNIQUE,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CHECK (status <> 'paid' OR tx_reference IS NOT NULL)   -- paid always has evidence
);
CREATE UNIQUE INDEX payout_one_open_per_user ON payout_requests (user_id) WHERE status IN ('pending','in_progress','action_required');
CREATE TABLE payout_status_history (
  id           bigserial PRIMARY KEY,
  payout_id    uuid NOT NULL REFERENCES payout_requests(id),
  from_status  text,
  to_status    text NOT NULL,
  actor_id     uuid REFERENCES users(id),
  reason       text,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE reward_fulfillment (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id    uuid NOT NULL REFERENCES reward_claims(id),
  kind        text NOT NULL CHECK (kind IN ('whatsapp_promotion','telegram_stars','telegram_premium')),
  status      text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','failed','action_required')),
  delivery_confirmation text,
  notes       text,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CHECK (status <> 'completed' OR delivery_confirmation IS NOT NULL)
);

-- Qualifying a referral credits exactly one earn entry, atomically and idempotently.
CREATE FUNCTION qualify_referral(p_referral uuid, p_cents_per_referral int, p_max_rewarded int) RETURNS boolean
LANGUAGE plpgsql AS $$
DECLARE r referrals%ROWTYPE; n bigint;
BEGIN
  SELECT * INTO r FROM referrals WHERE id = p_referral FOR UPDATE;
  IF NOT FOUND OR r.status NOT IN ('pending','under_review') THEN RETURN false; END IF;
  UPDATE referrals SET status = 'qualified', qualified_at = now() WHERE id = r.id;
  INSERT INTO referral_events (referral_id, event) VALUES (r.id, 'qualified');
  SELECT count(*) INTO n FROM referrals WHERE referrer_id = r.referrer_id AND status = 'qualified';
  IF n <= p_max_rewarded THEN
    INSERT INTO reward_ledger (user_id, type, amount_cents, reference, idempotency_key)
    VALUES (r.referrer_id, 'earn', p_cents_per_referral, 'referral:' || r.id, 'referral:' || r.id)
    ON CONFLICT (idempotency_key) DO NOTHING;
  END IF;
  RETURN true;
END $$;

-- Withdrawal request: serialised per user, minimum enforced, exactly one reservation entry.
CREATE FUNCTION request_payout(p_user uuid, p_amount bigint, p_min bigint, p_method_kind text,
                               p_snapshot_enc text, p_hint text, p_idem text) RETURNS uuid
LANGUAGE plpgsql AS $$
DECLARE available bigint; pid uuid;
BEGIN
  PERFORM 1 FROM users WHERE id = p_user AND status = 'active' FOR UPDATE;   -- row lock = per-user mutex
  IF NOT FOUND THEN RAISE EXCEPTION 'user not active'; END IF;
  SELECT id INTO pid FROM payout_requests WHERE idempotency_key = p_idem;
  IF FOUND THEN RETURN pid; END IF;                                          -- replay returns the original request
  SELECT COALESCE(available_cents, 0) INTO available FROM reward_balances WHERE user_id = p_user;
  available := COALESCE(available, 0);
  IF p_amount < p_min THEN RAISE EXCEPTION 'below withdrawal minimum'; END IF;
  IF p_amount > available THEN RAISE EXCEPTION 'insufficient available balance'; END IF;
  INSERT INTO payout_requests (user_id, amount_cents, method_kind, recipient_snapshot_enc, masked_hint, idempotency_key)
  VALUES (p_user, p_amount, p_method_kind, p_snapshot_enc, p_hint, p_idem) RETURNING id INTO pid;
  INSERT INTO reward_ledger (user_id, type, amount_cents, payout_id, reference, idempotency_key)
  VALUES (p_user, 'reserve', p_amount, pid, 'payout:' || pid, 'reserve:' || pid);
  INSERT INTO payout_status_history (payout_id, from_status, to_status, actor_id) VALUES (pid, NULL, 'pending', p_user);
  RETURN pid;
END $$;

-- ---------- community ----------
CREATE TABLE notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind        text NOT NULL,
  payload     jsonb NOT NULL DEFAULT '{}',
  essential   boolean NOT NULL DEFAULT false,
  read_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_idx ON notifications (user_id, created_at DESC);
CREATE TABLE announcements (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind        text NOT NULL CHECK (kind IN ('product','feature','challenge','reward','maintenance','security')),
  title       jsonb NOT NULL,
  body        jsonb NOT NULL,
  published_at timestamptz,
  created_by  uuid REFERENCES users(id)
);
CREATE TABLE support_tickets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id),
  category    text NOT NULL CHECK (category IN ('bug','payment','account','partnership','feature','other')),
  subject     text NOT NULL,
  body        text NOT NULL,
  status      text NOT NULL DEFAULT 'open' CHECK (status IN ('open','pending','closed')),
  priority    text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  assigned_to uuid REFERENCES users(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------- administration ----------
CREATE TABLE admin_permissions (
  code        text PRIMARY KEY,
  description text NOT NULL
);
CREATE TABLE admin_roles (
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('super_admin','user_manager','finance_manager','challenge_manager','support_agent','auditor')),
  granted_by  uuid REFERENCES users(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);
CREATE TABLE admin_role_permissions (
  role        text NOT NULL,
  permission  text NOT NULL REFERENCES admin_permissions(code),
  PRIMARY KEY (role, permission)
);
CREATE TABLE admin_audit_logs (
  id            bigserial PRIMARY KEY,
  actor_id      uuid NOT NULL REFERENCES users(id),
  action        text NOT NULL,
  resource_type text NOT NULL,
  resource_id   text,
  from_value    jsonb,
  to_value      jsonb,
  reason        text,
  correlation_id text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER admin_audit_no_update BEFORE UPDATE OR DELETE ON admin_audit_logs
  FOR EACH ROW EXECUTE FUNCTION reward_ledger_immutable();
CREATE TABLE security_events (
  id          bigserial PRIMARY KEY,
  user_id     uuid REFERENCES users(id) ON DELETE SET NULL,
  kind        text NOT NULL,
  detail      jsonb NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE account_restrictions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scope       text NOT NULL CHECK (scope IN ('account','referrals','rewards','challenges','read_only')),
  reason      text NOT NULL,
  admin_id    uuid NOT NULL REFERENCES users(id),
  starts_at   timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz,
  lifted_at   timestamptz
);
CREATE TABLE system_settings (
  key         text PRIMARY KEY,
  value       jsonb NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- configurable policy (read by the app, changed only through audited admin actions)
INSERT INTO system_settings (key, value) VALUES
  ('reward_policy', '{"centsPerReferral": 1, "minWithdrawCents": 1500, "maxRewardedReferrals": 1000000}'),
  ('intro_first_visit_only', 'true');
INSERT INTO vip_levels (name, min_xp) VALUES ('Bronze', 0), ('Silver', 1000), ('Gold', 5000), ('Legend', 20000);

INSERT INTO schema_migrations (version) VALUES ('0001_init');
COMMIT;
