# Google setup (sign-in and Google Contacts)

SYRIX VCF uses Google for two separate things:

1. **Sign-in** (always): OpenID Connect with the scopes `openid email profile`. Google tells us the account's stable ID, e-mail, name and picture. We never see the password.
2. **Google Contacts** (only when a user clicks *Connect Google Contacts*): the extra scope `https://www.googleapis.com/auth/contacts`, requested separately (incremental consent). It is used only to create and update contacts the user saved in SYRIX VCF, in that user's own Google account. Nothing is ever deleted in Google.

## 1. Create the project and enable the API
1. Open <https://console.cloud.google.com/>, create a project (e.g. "SYRIX VCF").
2. *APIs & Services → Library*: enable **Google People API**.

## 2. OAuth consent screen ("Google Auth Platform")
1. *Branding*: app name **SYRIX VCF**, support e-mail `syrixcompany@gmail.com`, logo `web/assets/icon-512.png` (resize to 120×120 if asked), home page `https://YOUR-DOMAIN/`, privacy policy `https://YOUR-DOMAIN/legal/privacy`, terms `https://YOUR-DOMAIN/legal/terms`, authorised domain `YOUR-DOMAIN`.
2. *Audience*: **External**. While in *Testing*, add your own Google accounts as test users (up to 100).
3. *Data access* (scopes): `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `.../auth/contacts`.

## 3. Create the OAuth client
*Clients → Create client → Web application*
- Authorised JavaScript origin: `https://YOUR-DOMAIN`
- Authorised redirect URI: `https://YOUR-DOMAIN/api/auth/google/callback` (exactly; `install.sh` prints it)

Copy the **client ID** and **client secret** into `.env` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`), or pass them to `scripts/install.sh`. Never commit them.

## 4. Verification before going public
`.../auth/contacts` is a **sensitive scope**. Until Google verifies the app:
- only test users can grant it (others see an "unverified app" block), and
- refresh tokens of apps in *Testing* expire after 7 days (users will see "Needs reconnection").

To publish: *Audience → Publish app*, then submit verification. Google asks for: a privacy policy on your domain that explains Contacts use (ours does: section 1, 2 and 4), a demo video of the consent and sync flow, and the domain verified in Search Console. Plan for several days to weeks.

## 5. Check it works
1. Sign in on `https://YOUR-DOMAIN/` with the `ADMIN_EMAIL` account; `/admin/` should open.
2. In the app: *Google sync → Connect Google Contacts*, accept, then add a contact; it appears in <https://contacts.google.com> within seconds (worker log: `docker compose logs -f worker`).
3. Revoke access at <https://myaccount.google.com/permissions>; the sync page then shows "Access removed" and nothing is retried until you reconnect.

## Quotas
The People API has per-project and per-user write limits. The worker paces writes (`SYNC_RATE_PER_SECOND`, default 5) and respects `Retry-After`. Large imports are queued and drained in the background; nothing is lost when a limit is hit.

## What has and has not been tested
The sign-in flow, the token verification, the incremental consent and the People API calls are covered by automated tests against a **simulated** Google (signed tokens, fake API). A round trip with the real Google needs your OAuth client and domain and has **not** been run yet. Do steps 5.1–5.3 after installing.
