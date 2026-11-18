/**
 * QUEEN AKUMA — Anti Group Mention (from Levanter)
 * Blocks / warns / kicks when someone does @group or group mention
 * .antigm on/off
 * .antigm delete | warn | kick
 * .antigm ignore <words>
 */
const db = require('../lib/jsondb');

const NAME = 'antigm';

function load() {
  return db.load(NAME, {
    enabled: false,
    action: 'delete', // delete | warn | kick
    ignore: []        // words to ignore
  });
}

module.exports = {
  command: 'antigm',
  aliases: ['antigroupmention', 'antimentionall'],
  category: 'group',
  description: 'Anti Group Mention - stop people tagging whole group',
  usage: '.antigm on/off | .antigm delete/warn/kick | .antigm ignore word1,word2',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    if (!isGroup) {
      return sock.sendMessage(chatId, { text: '❌ Sirf group me use karo.' }, { quoted: message });
    }

    const data = load();
    const sub = (args[0] || '').toLowerCase();
    const rest = args.slice(1).join(' ').trim();
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });

    if (!sub || sub === 'help' || sub === 'status') {
      return reply(
`🛡️ *Anti Group Mention (QUEEN AKUMA)*

Status: ${data.enabled ? '✅ ON' : '❌ OFF'}
Action: *${data.action}*
Ignore: ${data.ignore.length ? data.ignore.join(', ') : 'none'}

*Commands:*
• \`.antigm on\` / \`.antigm off\`
• \`.antigm delete\`  → message delete
• \`.antigm warn\`    → warn user
• \`.antigm kick\`    → kick user
• \`.antigm ignore word1,word2\`
• \`.antigm status\``
      );
    }

    if (sub === 'on') {
      data.enabled = true;
      db.save(NAME);
      return reply('✅ Anti Group Mention *ON* kar diya.');
    }
    if (sub === 'off') {
      data.enabled = false;
      db.save(NAME);
      return reply('❌ Anti Group Mention *OFF*.');
    }
    if (['delete', 'warn', 'kick'].includes(sub)) {
      data.action = sub;
      db.save(NAME);
      return reply(`✅ Action set to *${sub}*`);
    }
    if (sub === 'ignore') {
      if (!rest) return reply('❌ Example: `.antigm ignore admin,owner`');
      data.ignore = rest.split(/[, ]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
      db.save(NAME);
      return reply(`✅ Ignore list: ${data.ignore.join(', ') || 'cleared'}`);
    }

    return reply('Unknown. Use `.antigm help`');
  },

  async onMessage(sock, message, ctx) {
    try {
      const data = load();
      if (!data.enabled) return;
      const chatId = ctx.chatId;
      if (!chatId.endsWith('@g.us')) return;
      if (message.key.fromMe) return;

      // Detect group mention (@all style or mentions of many people)
      const msg = message.message || {};
      const contextInfo = msg.extendedTextMessage?.contextInfo || msg.imageMessage?.contextInfo || {};
      const mentioned = contextInfo.mentionedJid || [];

      // Common group mention patterns
      const text = (ctx.messageText || '').toLowerCase();
      const isGroupTag =
        mentioned.length >= 5 || // many mentions
        /@everyone|@all|@group|@here|mention all|tag all/i.test(text) ||
        (mentioned.length > 0 && /everyone|all members|sabko/i.test(text));

      if (!isGroupTag) return;

      // Check ignore words
      if (data.ignore.some(w => text.includes(w))) return;

      const sender = ctx.senderId || message.key.participant;

      // Check if sender is admin
      try {
        const meta = await sock.groupMetadata(chatId);
        const p = meta.participants.find(x => x.id === sender);
        if (p && (p.admin === 'admin' || p.admin === 'superadmin')) return;
      } catch {}

      if (data.action === 'delete') {
        await sock.sendMessage(chatId, { delete: message.key }).catch(() => {});
        await sock.sendMessage(chatId, { text: '🚫 Group mention allowed nahi hai!' });
      } else if (data.action === 'warn') {
        await sock.sendMessage(chatId, { text: `⚠️ @${sender.split('@')[0]} Group mention mat karo!`, mentions: [sender] });
      } else if (data.action === 'kick') {
        await sock.groupParticipantsUpdate(chatId, [sender], 'remove').catch(() => {});
        await sock.sendMessage(chatId, { text: `👢 Group mention ke liye kick: @${sender.split('@')[0]}`, mentions: [sender] });
      }
    } catch (e) {
      console.error('[antigm]', e.message);
    }
  }
};
