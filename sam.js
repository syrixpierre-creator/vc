/**
 * QUEEN AKUMA — sam.js
 * Legacy command registrar
 * Usage: sam({ pattern, alias, ... }, async (conn, mek, m, extras) => {})
 */
const commands = [];

function sam(info, func) {
  if (typeof info === 'function') {
    return sam;
  }
  if (!info || typeof info !== 'object') {
    return sam;
  }
  const entry = {
    pattern: info.pattern || info.cmd || info.command || '',
    alias: info.alias || info.aliases || [],
    desc: info.desc || info.description || '',
    category: info.category || 'misc',
    react: info.react || '',
    filename: info.filename || '',
    premium: !!info.premium,
    fromMe: !!info.fromMe,
    function: typeof func === 'function' ? func : async () => {}
  };
  if (entry.pattern) {
    commands.push(entry);
    try { require('./lib/compat').registrar({ ...info, pattern: entry.pattern, alias: entry.alias }, func); } catch (_) {}
  }
  return sam;
}

sam.cmd = sam;
sam.command = sam;
sam.commands = commands;
sam.add = sam;

sam.fakevCard = {
  key: {
    fromMe: false,
    participant: '0@s.whatsapp.net',
    remoteJid: 'status@broadcast'
  },
  message: {
    contactMessage: {
      displayName: '© QUEEN AKUMA',
      vcard:
        'BEGIN:VCARD\nVERSION:3.0\nFN:QUEEN AKUMA\nORG:INCONNU BOY SENSEI;\nTEL;type=CELL;type=VOICE;waid=554488138425:+554488138425\nEND:VCARD'
    }
  }
};

module.exports = sam;
module.exports.sam = sam;
module.exports.commands = commands;
module.exports.fakevCard = sam.fakevCard;
