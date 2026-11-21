/**
 * QUEEN AKUMA v3.5.0 • #14/#15 Privacy suite + GAAJU .viewer
 * .setprivacy — bot account ki WA privacy settings (lastseen/online/picture/
 *   status/readreceipts/groupsadd/disappearingmode). Stock Baileys 7.x me
 *   update*Privacy methods maujood hain (baileys-pro ki zaroorat nahi).
 * .getprivacy — current privacy settings dikhata hai.
 * .viewer — status privacy shortcut: everyone / nobody.
 * Owner-only.
 */
const TYPES = {
  lastseen: ['all', 'contacts', 'contact_blacklist', 'none'],
  online: ['all', 'match_last_seen'],
  picture: ['all', 'contacts', 'contact_blacklist', 'none'],
  status: ['all', 'contacts', 'contact_blacklist', 'none'],
  readreceipts: ['all', 'none'],
  groupsadd: ['all', 'contacts', 'contact_blacklist', 'none'],
  disappearingmode: [0, 86400, 604800, 7776000],
};
const TYPE_KEYS = Object.keys(TYPES);
const LABELS = { 0: 'off', 86400: '24 hours', 604800: '7 days', 7776000: '90 days' };

function menuText(prefix) {
  const lines = TYPE_KEYS.map((t, i) => `${i + 1}. ${t}`).join('\n');
  return `🔒 *Privacy Settings*\n\nUsage: \`${prefix}setprivacy <type#> <value#>\` ya \`${prefix}setprivacy <type> <value>\`\n\nTypes:\n${lines}\n\nExample: \`${prefix}setprivacy lastseen none\``;
}
function valuesText(type) {
  return `🔒 *${type}* — values:\n` + TYPES[type].map((v, i) => `${i + 1}. ${LABELS[v] || v}`).join('\n');
}
function resolveType(arg) {
  if (!arg) return null;
  const n = parseInt(arg, 10);
  if (!isNaN(n) && n >= 1 && n <= TYPE_KEYS.length) return TYPE_KEYS[n - 1];
  const low = String(arg).toLowerCase();
  return TYPE_KEYS.find((t) => t === low || t.startsWith(low)) || null;
}
function resolveValue(type, arg) {
  if (arg === undefined || arg === null || arg === '') return null;
  const n = parseInt(arg, 10);
  const vals = TYPES[type];
  if (!isNaN(n) && n >= 1 && n <= vals.length) return vals[n - 1];
  const low = String(arg).toLowerCase();
  const hit = vals.find((v) => String(v).toLowerCase() === low);
  if (hit !== undefined) return hit;
  if (type === 'disappearingmode') {
    const byLabel = vals.find((v) => (LABELS[v] || '').toLowerCase() === low);
    if (byLabel !== undefined) return byLabel;
  }
  return null;
}

const SETTERS = {
  lastseen: 'updateLastSeenPrivacy',
  online: 'updateOnlinePrivacy',
  picture: 'updateProfilePicturePrivacy',
  status: 'updateStatusPrivacy',
  readreceipts: 'updateReadReceiptsPrivacy',
  groupsadd: 'updateGroupsAddPrivacy',
  disappearingmode: 'updateDefaultDisappearingMode',
};

module.exports = {
  command: 'setprivacy',
  aliases: ['getprivacy', 'viewer', 'setppall', 'setonline'],
  category: 'owner',
  description: 'Set/view bot WhatsApp privacy settings (lastseen, online, picture, status, etc.)',
  usage: '.setprivacy <type> <value> | .getprivacy | .viewer everyone/nobody',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const prefix = '.';
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    if (!context.isOwnerOrSudoCheck) return reply('🚫 *You are not authorized to use this command!*');
    const invoked = String((context.rawText || message.body || '').replace(/^\./, '').split(/\s+/)[0] || 'setprivacy').toLowerCase();

    // --- .getprivacy: current settings ---
    if (invoked === 'getprivacy') {
      try {
        const s = await sock.fetchPrivacySettings();
        const rows = [
          ['Last seen', s.lastseen], ['Online', s.online], ['Profile pic', s.profile],
          ['Status', s.status], ['Read receipts', s.readreceipts],
          ['Groups add', s.groupadd], ['Call add', s.calladd],
          ['Disappearing', s.disappearing != null ? (LABELS[s.disappearing] || s.disappearing) : undefined],
        ].filter(([, v]) => v !== undefined && v !== null)
          .map(([k, v]) => `• ${k}: *${LABELS[v] || v}*`).join('\n');
        return reply(`🔒 *Privacy settings*\n\n${rows || 'Could not read settings.'}`);
      } catch (e) {
        return reply('❌ *Failed to read privacy settings:* ' + (e.message || e));
      }
    }

    // --- .viewer: status privacy shortcut ---
    if (invoked === 'viewer') {
      const v = String(args[0] || '').toLowerCase();
      const map = { everyone: 'all', all: 'all', contacts: 'contacts', except: 'contact_blacklist', nobody: 'none', none: 'none' };
      if (!map[v]) {
        return reply('❌ *Invalid option!*\n\nAvailable options:\n- everyone\n- contacts\n- except\n- nobody');
      }
      const val = map[v];
      try {
        await sock.updateStatusPrivacy(val);
        return reply(`👁️ Status privacy set: *${v === 'all' || v === 'everyone' ? 'everyone' : v}*`);
      } catch (e) {
        return reply('❌ *Failed to set status privacy:* ' + (e.message || e));
      }
    }

    // --- .setprivacy / .setppall / .setonline shortcuts ---
    let type = null; let value = null;
    if (invoked === 'setppall') { type = 'picture'; value = resolveValue('picture', args[0]); }
    else if (invoked === 'setonline') { type = 'online'; value = resolveValue('online', args[0]); }
    else {
      type = resolveType(args[0]);
      if (!type) return reply(menuText(prefix));
      value = resolveValue(type, args[1]);
      if (value === null || value === undefined) return reply(valuesText(type));
    }
    const setter = SETTERS[type];
    try {
      if (typeof sock[setter] !== 'function') throw new Error(`${setter} is not available on this Baileys version`);
      await sock[setter](value);
      const shown = LABELS[value] || value;
      return reply(`✅ *Privacy ${type} set to: ${shown}*`);
    } catch (e) {
      return reply(`❌ *Failed to set privacy ${type}:* ${e.message || e}`);
    }
  },
};
