-- 0005: everything the full platform needs on top of 0001-0004:
-- onboarding, several phone numbers per contact, labels, change history, backups, referral clicks and milestones,
-- the $10 milestone reward, reward fulfilment, more challenge metrics, achievements, notifications, announcements,
-- support conversations, account restrictions/deletion, sessions metadata, operational status.
BEGIN;

-- ---------- users / onboarding / lifecycle ----------
ALTER TABLE users ADD COLUMN suspended_until timestamptz;
ALTER TABLE users ADD COLUMN suspension_reason text;
ALTER TABLE users ADD COLUMN deletion_requested_at timestamptz;
ALTER TABLE users ADD COLUMN premium_until timestamptz;
ALTER TABLE users ADD COLUMN avatar_url text;
CREATE INDEX users_status_idx ON users (status);
CREATE INDEX users_created_idx ON users (created_at);

ALTER TABLE user_settings ADD COLUMN notify_inapp_progress boolean NOT NULL DEFAULT true;   -- non-essential in-app notices
ALTER TABLE user_settings ADD COLUMN notify_email_rewards boolean NOT NULL DEFAULT true;    -- reward and payout e-mails
ALTER TABLE user_settings ADD COLUMN theme text NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark','light','system'));

ALTER TABLE sessions ADD COLUMN last_ip_prefix text;
CREATE INDEX sessions_user_all_idx ON sessions (user_id, created_at DESC);

-- ---------- contacts: several phone numbers (E.164), labels, history ----------
ALTER TABLE contacts ADD COLUMN phones text[] NOT NULL DEFAULT '{}';
UPDATE contacts SET phones = ARRAY[phone_e164] WHERE phone_e164 IS NOT NULL;
ALTER TABLE contacts ADD CONSTRAINT contacts_phones_max CHECK (cardinality(phones) <= 10);
ALTER TABLE contacts ADD CONSTRAINT contacts_primary_phone CHECK (phone_e164 IS NOT DISTINCT FROM phones[1]);
CREATE INDEX contacts_phones_gin ON contacts USING gin (phones);
CREATE INDEX contacts_user_created_idx ON contacts (user_id, created_at DESC);
CREATE INDEX contacts_user_updated_idx ON contacts (user_id, updated_at DESC);

ALTER TABLE contact_labels ADD COLUMN color text NOT NULL DEFAULT 'blue' CHECK (color IN ('blue','violet','teal','amber','rose','slate'));
ALTER TABLE contact_labels ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX contact_label_links_label_idx ON contact_label_links (label_id);

ALTER TABLE contact_change_history ADD COLUMN fields text[] NOT NULL DEFAULT '{}';      -- names of changed fields, never values
ALTER TABLE contact_change_history ADD COLUMN source text NOT NULL DEFAULT 'app';
CREATE INDEX contact_change_history_contact_idx ON contact_change_history (user_id, contact_id, created_at DESC);

-- duplicate suggestions the user dismissed ("these two are different people")
CREATE TABLE contact_duplicate_dismissals (
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pair_key   text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, pair_key)
);

-- ---------- backups: encrypted VCF envelope (AES-256-GCM, bound to the row id) ----------
ALTER TABLE contact_backups ALTER COLUMN payload_enc TYPE text USING encode(payload_enc, 'base64');
ALTER TABLE contact_backups ADD COLUMN kind text NOT NULL DEFAULT 'manual' CHECK (kind IN ('manual','automatic','before_restore'));
ALTER TABLE contact_backups ADD COLUMN label text;
ALTER TABLE contact_backups ADD COLUMN size_bytes int NOT NULL DEFAULT 0;
ALTER TABLE contact_backups ADD COLUMN restored_at timestamptz;
CREATE INDEX contact_backups_user_idx ON contact_backups (user_id, created_at DESC);

ALTER TABLE contact_sync_logs ADD COLUMN contact_id uuid;
ALTER TABLE contact_sync_jobs ADD COLUMN finished_at timestamptz;

-- ---------- referrals: clicks, milestones ----------
ALTER TABLE referral_events ADD COLUMN referrer_id uuid REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX referral_events_referrer_idx ON referral_events (referrer_id, event, created_at);

CREATE TABLE referral_milestones (
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  threshold   int  NOT NULL,
  reached_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, threshold)
);

-- ---------- reward claims and fulfilment ----------
ALTER TABLE reward_claims DROP CONSTRAINT reward_claims_status_check;
ALTER TABLE reward_claims ADD CONSTRAINT reward_claims_status_check
  CHECK (status IN ('pending','in_progress','completed','failed','action_required','rejected'));
ALTER TABLE reward_claims ADD COLUMN amount_cents bigint CHECK (amount_cents IS NULL OR amount_cents > 0);
ALTER TABLE reward_claims ADD COLUMN detail jsonb NOT NULL DEFAULT '{}';
ALTER TABLE reward_claims ADD COLUMN note text;
ALTER TABLE reward_claims ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX reward_claims_user_idx ON reward_claims (user_id, created_at DESC);
CREATE INDEX reward_claims_status_idx ON reward_claims (status, created_at);

ALTER TABLE reward_fulfillment DROP CONSTRAINT reward_fulfillment_kind_check;
ALTER TABLE reward_fulfillment ADD CONSTRAINT reward_fulfillment_kind_check
  CHECK (kind IN ('whatsapp_promotion','telegram_stars','telegram_premium','premium','vip'));
ALTER TABLE reward_fulfillment ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE reward_fulfillment ADD COLUMN admin_id uuid REFERENCES users(id);
CREATE UNIQUE INDEX reward_fulfillment_claim_uq ON reward_fulfillment (claim_id);

ALTER TABLE payout_requests ADD COLUMN source text NOT NULL DEFAULT 'withdrawal' CHECK (source IN ('withdrawal','milestone','challenge'));
ALTER TABLE payout_requests ADD COLUMN reward_claim_id uuid REFERENCES reward_claims(id);
ALTER TABLE payout_requests ADD COLUMN paid_at timestamptz;
ALTER TABLE payout_requests ADD COLUMN reviewed_by uuid REFERENCES users(id);
ALTER TABLE payout_requests ADD COLUMN recipient_name text;
CREATE INDEX payout_requests_status_idx ON payout_requests (status, created_at DESC);
ALTER TABLE payout_status_history ADD COLUMN tx_reference text;
CREATE INDEX payout_status_history_payout_idx ON payout_status_history (payout_id, created_at);

-- ---------- challenges ----------
ALTER TABLE challenge_definitions ADD COLUMN review_required boolean NOT NULL DEFAULT false;
ALTER TABLE challenge_definitions ADD COLUMN eligibility jsonb NOT NULL DEFAULT '{}';
ALTER TABLE challenge_definitions ADD COLUMN created_by uuid REFERENCES users(id);
ALTER TABLE challenge_participation ADD COLUMN review_note text;
ALTER TABLE challenge_participation ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE user_events DROP CONSTRAINT user_events_type_check;
ALTER TABLE user_events ADD CONSTRAINT user_events_type_check CHECK (type IN (
  'qualified_referrals','active_days','verified_operations','challenges_completed',
  'contacts_labeled','duplicates_reviewed','vcf_imports','vcf_exports','backups_created',
  'security_tasks','sync_successes','admin_verified'));

-- ---------- progression ----------
ALTER TABLE vip_levels ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
UPDATE vip_levels SET benefits = CASE name
  WHEN 'Bronze' THEN '{"en":"Core features, monthly challenges"}'
  WHEN 'Silver' THEN '{"en":"Silver profile badge, early access to new challenges"}'
  WHEN 'Gold'   THEN '{"en":"Gold profile badge, priority support replies"}'
  WHEN 'Legend' THEN '{"en":"Legend profile badge, priority support, invitation to beta features"}'
  ELSE benefits END::jsonb;
CREATE INDEX user_xp_ledger_user_idx ON user_xp_ledger (user_id, created_at);

-- ---------- community ----------
ALTER TABLE notifications ADD COLUMN title_key text;
CREATE INDEX notifications_unread_idx ON notifications (user_id) WHERE read_at IS NULL;

ALTER TABLE announcements ADD COLUMN status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived'));
ALTER TABLE announcements ADD COLUMN pinned boolean NOT NULL DEFAULT false;
ALTER TABLE announcements ADD COLUMN show_on_site boolean NOT NULL DEFAULT false;
ALTER TABLE announcements ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE announcements ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE support_tickets ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE support_tickets ADD COLUMN closed_at timestamptz;
CREATE INDEX support_tickets_user_idx ON support_tickets (user_id, created_at DESC);
CREATE INDEX support_tickets_status_idx ON support_tickets (status, priority, created_at);
CREATE TABLE support_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_id   uuid REFERENCES users(id) ON DELETE SET NULL,
  is_staff    boolean NOT NULL DEFAULT false,
  internal    boolean NOT NULL DEFAULT false,                 -- staff-only note, never shown to the user
  body        text NOT NULL CHECK (length(body) BETWEEN 1 AND 5000),
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX support_messages_ticket_idx ON support_messages (ticket_id, created_at);

-- ---------- security / administration ----------
ALTER TABLE security_events ADD COLUMN ip_prefix text;
CREATE INDEX security_events_user_idx ON security_events (user_id, created_at DESC);
CREATE INDEX security_events_kind_idx ON security_events (kind, created_at DESC);
CREATE INDEX admin_audit_logs_created_idx ON admin_audit_logs (created_at DESC);
CREATE INDEX admin_audit_logs_resource_idx ON admin_audit_logs (resource_type, resource_id);
ALTER TABLE account_restrictions ADD COLUMN lifted_by uuid REFERENCES users(id);
ALTER TABLE account_restrictions ADD COLUMN lift_reason text;
CREATE INDEX account_restrictions_user_idx ON account_restrictions (user_id) WHERE lifted_at IS NULL;

ALTER TABLE users DROP CONSTRAINT users_review_status_check;
ALTER TABLE users ADD CONSTRAINT users_review_status_check CHECK (review_status IN ('none','flagged','under_review','cleared','confirmed_fraud'));
ALTER TABLE users ADD COLUMN review_reason text;

-- permissions catalogue (the matrix itself lives in server/src/auth/rbac.ts, one place)
INSERT INTO admin_permissions (code, description) VALUES
  ('users.read','View users and account metadata (never contact contents)'),
  ('users.suspend','Suspend and reinstate accounts'),
  ('users.restrict','Apply and lift referral/reward/challenge/read-only restrictions'),
  ('sessions.revoke','Revoke a user''s sessions'),
  ('payouts.read','View payout requests (masked recipients)'),
  ('payouts.review','Move payout requests through review states'),
  ('payouts.mark_paid','Record a verified manual payment as paid'),
  ('ledger.adjust','Create auditable ledger adjustments and fund budget-blocked claims'),
  ('rewards.fulfil','Update WhatsApp/Telegram fulfilment records'),
  ('challenges.manage','Create, edit and publish challenges'),
  ('announcements.manage','Publish announcements'),
  ('tickets.read','Read support tickets'),
  ('tickets.respond','Answer, assign and close support tickets'),
  ('fraud.review','Resolve referral and account reviews'),
  ('audit.read','Read the audit log and security events'),
  ('roles.manage','Grant and revoke administrator roles'),
  ('reports.export','Export permitted reports'),
  ('settings.manage','Change reward budgets, VIP levels and system settings'),
  ('sync.manage','Retry sync jobs and request Google reconnection'),
  ('deletions.manage','Process account deletion requests')
ON CONFLICT (code) DO NOTHING;

-- operational status written by the worker and the backup script
CREATE TABLE service_heartbeats (
  name        text PRIMARY KEY,
  beat_at     timestamptz NOT NULL DEFAULT now(),
  info        jsonb NOT NULL DEFAULT '{}'
);
CREATE TABLE ops_backups (
  id          bigserial PRIMARY KEY,
  started_at  timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status      text NOT NULL CHECK (status IN ('running','ok','failed')),
  file_name   text,
  size_bytes  bigint,
  offsite     boolean NOT NULL DEFAULT false,
  error       text
);

-- reward policy: the cash reward is the one-time $10.00 USD at 500 qualified referrals (see referral_milestones, cashCents).
-- No per-referral rate by default. Changed only through audited admin actions.
UPDATE system_settings SET value = '{"centsPerReferral": 0, "minWithdrawCents": 1000, "maxRewardedReferrals": 1000000}', updated_at = now()
WHERE key = 'reward_policy';
INSERT INTO system_settings (key, value) VALUES
  ('referral_milestones', '[{"threshold":10,"xp":50,"badge":"referrals_10"},{"threshold":25,"xp":100,"badge":"referrals_25"},{"threshold":50,"xp":200,"badge":"referrals_50"},{"threshold":100,"xp":400,"badge":"referrals_100"},{"threshold":250,"xp":800,"badge":"referrals_250"},{"threshold":500,"xp":1500,"badge":"referrals_500","cashCents":1000}]'),
  ('referral_policy', '{"minAccountAgeHours": 24, "maxPerNetworkPerDay": 3}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO schema_migrations (version) VALUES ('0005_platform');
COMMIT;
