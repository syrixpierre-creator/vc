-- 0004: what the Google Contacts sync needs on top of 0001-0003.
-- NOTE: written to be applied with psql after 0003; not yet executed against a live database.
BEGIN;

-- the Contacts connection flow is bound to the signed-in user, so a callback cannot attach someone else's account
ALTER TABLE oauth_pending ADD COLUMN purpose text NOT NULL DEFAULT 'login' CHECK (purpose IN ('login', 'contacts'));
ALTER TABLE oauth_pending ADD COLUMN user_id uuid REFERENCES users(id) ON DELETE CASCADE;

-- connecting Google Contacts is an explicit act, so automatic sync is on by default once connected (the user can turn it off)
ALTER TABLE user_settings ALTER COLUMN auto_sync SET DEFAULT true;

ALTER TABLE contact_sync_jobs ALTER COLUMN id SET DEFAULT gen_random_uuid();
CREATE INDEX contact_sync_jobs_user_idx ON contact_sync_jobs (user_id, status);
CREATE INDEX contact_sync_logs_user_idx ON contact_sync_logs (user_id, outcome, created_at);

INSERT INTO schema_migrations (version) VALUES ('0004_sync_support');
COMMIT;
