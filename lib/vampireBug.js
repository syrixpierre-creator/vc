/** Crash/bug payloads are intentionally disabled in QUEEN-AKUMA-PRO:
 * they harm other users and get the bot number banned (see CHANGELOG-PRO).
 * Callers get a clear error instead of silently doing nothing. */
async function sendVampireBug() {
  throw new Error('Bug/crash commands are disabled in QUEEN-AKUMA-PRO.');
}
module.exports = { sendVampireBug };
