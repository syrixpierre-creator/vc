/**
 * QUEEN AKUMA v3.5.0 • #2 Audit Log (queen-akuma)
 * .auditlog [count] — last admin actions (kick/promote/demote/settings...)
 * .audit @user — us user se related entries
 * Group participant events (add/remove/promote/demote) onGroup hook se
 * automatically log hote hain (lib/auditLog.js).
 */
const { logAction, getLogs } = require('../lib/auditLog');

const ICONS = {
  kick: '🚫', promote: '⬆️', demote: '⬇️', ban: '🔨', unban: '✅',
  mute: '🔇', unmute: '🔊', settings: '⚙️', welcome: '👋', antilink: '🔗',
  warn: '⚠️', add: '➕', remove: '➖', default: '📝',
};

module.exports = {
  command: 'auditlog',
  aliases: ['audit', 'adminlog', 'actionlog', 'grouplog'],
  category: 'group',
  description: 'View admin action audit log — kicks, promotes, demotes, settings changes',
  usage: '.auditlog [number] | .audit @user',
  groupOnly: true,
  adminOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t, mentions) => sock.sendMessage(chatId, { text: t, mentions: mentions || [] }, { quoted: message });
    const logs = getLogs(chatId);
    if (!logs.length) {
      return reply('📋 *Audit Log*\n\nNo actions recorded yet.\n\nBot tracks:\n• Kicks & removals\n• Promotes & demotes\n• Group settings changes\n• Ban/unban actions');
    }
    const m = message.message || {};
    const mentioned = m.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let filtered = logs;
    if (mentioned.length) {
      const target = mentioned[0];
      filtered = logs.filter((l) => l.actor === target || l.target === target);
      if (!filtered.length) return reply(`📋 No audit entries found for @${target.split('@')[0]}.`, [target]);
    }
    const count = parseInt(args[0], 10) || 20;
    const recent = filtered.slice(-count).reverse();
    const list = recent.map((l) => {
      const icon = ICONS[l.action] || ICONS.default;
      const date = new Date(l.timestamp);
      const timeStr = `${date.toLocaleDateString('en-IN')} ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
      const targetStr = l.targetNum ? ` → @${l.targetNum}` : '';
      const detailStr = l.details ? `\n   _${l.details}_` : '';
      return `${icon} *${String(l.action).toUpperCase()}*\n   By: @${l.actorNum}${targetStr}\n   ${timeStr}${detailStr}`;
    }).join('\n\n');
    const allMentions = [...new Set(recent.flatMap((l) => [l.actor, l.target].filter(Boolean)))];
    return reply(`📋 *Audit Log* (last ${recent.length})\n\n${list}\n\n_Total entries: ${logs.length}_\n_Filter by user: \`.audit @user\`_`, allMentions);
  },
  // Group participant events — messageHandler runHooks('group') se aata hai.
  async onGroupUpdate(sock, update) {
    try {
      const chatId = update.id;
      if (!chatId || !chatId.endsWith('@g.us')) return;
      const actor = update.author || update.actor || '';
      for (const p of update.participants || []) {
        if (update.action === 'add') logAction(chatId, 'add', actor, p);
        else if (update.action === 'remove') logAction(chatId, 'remove', actor, p);
        else if (update.action === 'promote') logAction(chatId, 'promote', actor, p);
        else if (update.action === 'demote') logAction(chatId, 'demote', actor, p);
      }
    } catch (_) {}
  },
};
