# Ads policy (SYRIX VCF)

Ads are **off by default** (`ADS_ENABLED=false`). To turn them on, set `ADS_ENABLED=true` and `ADS_CLIENT_ID` (your ad provider's publisher id).

## Rules enforced in the code
- Ads load only after the visitor accepts the consent banner. "No thanks" keeps every feature.
- Slots exist only on the public landing page and the dashboard overview. Pages that show contacts, wallet, payouts or admin tools carry no slot (`data-no-ads`).
- Ad scripts never receive contact data, balances or payout details. Contacts are never used for targeting.
- Every slot is labelled "Advertisement".
- Reward rules never depend on clicking or viewing ads. Never ask users to click ads (ad networks ban it and it can close your account).

## Before going live (not done yet)
- Apply to the ad network and wait for approval. Approval normally needs real, original public content and a privacy policy that mentions ads and cookies.
- Add a compliant consent tool for EU/UK/Brazil visitors if you serve them (the built-in banner is a minimal opt-in, not a certified CMP).
- The Content-Security-Policy (set by the app, `server/src/http/static.ts`) adds the ad provider's domains automatically only when `ADS_ENABLED=true`.
- The privacy policy already describes ads and consent (section 4 and 6); review it with the provider's requirements.
- Referral fraud also hurts ad revenue (invalid traffic can get an ad account suspended), so keep the anti-fraud review on.

## Money reality check
Ad revenue per visitor is small and varies a lot. Keep `reward_budget.globalCapCents` below what ad revenue has actually paid, not what you hope it will pay.
