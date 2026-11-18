const settings = require('../settings');
const { isSudo } = require('./index');

function cleanJid(jid) {
  if (!jid) return '';
  return String(jid).split(':')[0].split('@')[0];
}

function onlyDigits(v) {
  return String(v || '').replace(/\D/g, '');
}

function sameNumber(a, b) {
  const da = onlyDigits(a);
  const db = onlyDigits(b);
  if (!da || !db) return false;
  if (da === db) return true;
  // last 10–12 digits match (country code variance)
  const ta = da.slice(-12);
  const tb = db.slice(-12);
  if (ta.length >= 10 && tb.length >= 10 && (ta.endsWith(tb) || tb.endsWith(ta))) return true;
  return false;
}

function ownerDigits() {
  return onlyDigits(settings.ownerNumber);
}

/**
 * True if this JID is the connected bot account itself
 */
function isBotAccount(sock, senderId) {
  if (!sock?.user || !senderId) return false;
  const botIds = [sock.user.id, sock.user.lid, sock.user.jid].filter(Boolean);
  for (const b of botIds) {
    if (sameNumber(b, senderId) || cleanJid(b) === cleanJid(senderId)) return true;
    if (String(b).split(':')[0] === String(senderId).split(':')[0]) return true;
  }
  return false;
}

/**
 * Owner OR sudo OR bot self
 */
async function isOwnerOrSudo(senderId, sock = null, chatId = null) {
  try {
    if (!senderId) return false;

    // Owner number match (phone / lid digits)
    if (sameNumber(senderId, settings.ownerNumber)) return true;

    // Bot's own account (linked device messages sometimes)
    if (sock && isBotAccount(sock, senderId)) return true;

    // Sudo list
    try {
      if (await isSudo(senderId)) return true;
    } catch (_) {}

    // Group: resolve LID → real participant id / phoneNumber
    if (sock && chatId && String(chatId).endsWith('@g.us')) {
      try {
        const metadata = await sock.groupMetadata(chatId);
        const participants = metadata.participants || [];
        const owner = ownerDigits();

        for (const p of participants) {
          const ids = [p.id, p.lid, p.jid, p.phoneNumber].filter(Boolean);
          const isThisSender = ids.some(
            (id) => cleanJid(id) === cleanJid(senderId) || sameNumber(id, senderId)
          );
          if (!isThisSender) continue;

          // this participant is the sender — are they owner?
          for (const id of ids) {
            if (sameNumber(id, owner)) return true;
            try {
              if (await isSudo(id)) return true;
            } catch (_) {}
          }
        }
      } catch (_) {}
    }

    return false;
  } catch (e) {
    console.error('[isOwner]', e.message);
    return false;
  }
}

function isOwnerOnly(senderId) {
  if (!senderId) return false;
  if (sameNumber(senderId, settings.ownerNumber)) return true;
  // Optional owner LID (set in settings.ownerLid or env)
  const lid = settings.ownerLid || process.env.OWNER_LID || '';
  if (lid && sameNumber(senderId, lid)) return true;
  // digit-only compare against OWNER_NUMBER list
  const multi = String(process.env.OWNERS || settings.ownerNumber || '').split(/[,;\s]+/).filter(Boolean);
  for (const o of multi) {
    if (sameNumber(senderId, o)) return true;
  }
  return false;
}

async function getCleanName(jid, sock) {
  if (!jid) return 'Unknown';
  return cleanJid(jid) || onlyDigits(jid) || 'Unknown';
}

module.exports = isOwnerOrSudo;
module.exports.isOwnerOnly = isOwnerOnly;
module.exports.cleanJid = cleanJid;
module.exports.getCleanName = getCleanName;
module.exports.sameNumber = sameNumber;
module.exports.isBotAccount = isBotAccount;
