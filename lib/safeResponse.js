/**
 * QUEEN AKUMA — Sanitize API/bot replies (block HTML/garbage)
 */
function isBadPayload(text) {
  if (text == null) return true;
  const s = String(text);
  if (!s.trim()) return true;
  const low = s.slice(0, 500).toLowerCase();
  if (low.includes('<!doctype') || low.includes('<html') || low.includes('<head') || low.includes('<body')) return true;
  if (low.includes('window.location') || low.includes('<script')) return true;
  if (low.includes('loading...') && low.includes('script')) return true;
  // giant base64-looking dump without spaces
  if (s.length > 800 && !/\s/.test(s.slice(0, 200)) && /eyJ[A-Za-z0-9+\/=]{40,}/.test(s)) return true;
  return false;
}

function cleanText(text, max = 3500) {
  if (text == null) return null;
  if (typeof text === 'object') {
    try { text = JSON.stringify(text, null, 2); } catch { text = String(text); }
  }
  text = String(text).trim();
  if (isBadPayload(text)) return null;
  // strip residual tags lightly
  if (/<[^>]+>/.test(text) && text.length > 200) {
    const stripped = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (isBadPayload(stripped) || stripped.length < 5) return null;
    text = stripped;
  }
  return text.slice(0, max);
}

function safeReplyText(text, fallback = '❌ Service temporarily unavailable. Try `.menu` / `.ai` / `.play`') {
  return cleanText(text) || fallback;
}

module.exports = { isBadPayload, cleanText, safeReplyText };
