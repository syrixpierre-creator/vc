-- 0002: one phone number per account (unique across accounts), referral network hash, reward budget settings.
-- NOTE: written to be applied with psql after 0001; not yet executed against a live database.
BEGIN;

ALTER TABLE users ADD COLUMN phone_e164 text
  CHECK (phone_e164 IS NULL OR phone_e164 ~ '^\+[1-9][0-9]{7,14}$');
-- one number, one account: a number already used by another account is refused by the database itself
CREATE UNIQUE INDEX users_phone_uq ON users (phone_e164) WHERE phone_e164 IS NOT NULL;

ALTER TABLE referrals ADD COLUMN network_hash bytea;
CREATE INDEX referrals_network_idx ON referrals (network_hash, created_at);

-- Budget caps. Global cap = $100 for now; raise it through an audited admin change.
INSERT INTO system_settings (key, value) VALUES
  ('reward_budget', '{"perUserCapCents": 1000000, "globalCapCents": 10000}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO schema_migrations (version) VALUES ('0002_phone_budget_referral_network');
COMMIT;
