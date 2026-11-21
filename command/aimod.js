/**
 * QUEEN AKUMA v3.2.0 — AI Auto-Admin commands
 * .aimod on | .aimod off | .aimod status | .aimod reset @user
 * .aimod set warnlimit <n> | .aimod set kick on|off | .aimod set delete on|off
 * .aimod list — group admin ya owner only. Group me hi chalta hai.
 */
const aiMod = require('../lib/aiMod');

async function isAdminOrOwner(sock, message, chatId) {
  const senderJid = message.key.participant || message.key.remoteJid;
  try {
    const isOwner = require('../lib/isOwner');
    if (isOwner.isOwnerOnly && isOwner.isOwnerOnly(senderJid)) return true;
    if (await isOwner(senderJid, sock, chatId)) return true;
  } catch (_) {}
  const meta = await aiMod.getGroupMeta(sock, chatId);
  return aiMod.isGroupAdmin(meta, senderJid);
}

module.exports = { commands: [
  {
    command: 'aimod',
    aliases: ['aiguard'],
    category: 'group',
    description: 'AI Auto-Admin — Gemini se group moderation',
    usage: '.aimod on | .aimod off | .aimod status | .aimod reset @user',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const senderJid = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      if (!chatId.endsWith('@g.us')) return reply('❌ *This command can only be used in groups!*');
      const sub = (args[0] || 'status').toLowerCase();

      if (sub === 'status' || sub === 'list') {
        const st = aiMod.getStatus(chatId);
        const top = st.strikes.length
          ? st.strikes.map((s, i) => `${i + 1}. @${s.jid} — ${s.count} strikes (${s.lastReason})`).join('\n')
          : 'No strikes.';
        return reply(`🤖 *AI Auto-Admin:* ${st.enabled ? 'ON' : 'OFF'}\nWarn limit: ${st.warnLimit}\n\n⚠️ *Top strikes*\n${top}`);
      }

      if (!(await isAdminOrOwner(sock, message, chatId))) return reply('🚫 *You are not authorized to use this command!*');

      if (sub === 'on') {
        aiMod.setEnabled(chatId, true);
        const st = aiMod.getStatus(chatId);
        return reply(`✅ *AI Auto-Admin ENABLED*${st.keySet ? '' : '\n⚠️ GEMINI_API_KEY is missing.'}`);
      }
      if (sub === 'off') {
        aiMod.setEnabled(chatId, false);
        return reply('🤖 AI Auto-Admin OFF kar diya. ❌');
      }
      if (sub === 'reset') {
        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
          || message.message?.extendedTextMessage?.contextInfo?.participant;
        const target = mentioned || (args[1] ? args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
        if (!target) return reply('❌ Usage: `.aimod reset @user` (mention karo)');
        aiMod.clearStrikes(chatId, target);
        return reply(`✅ @${aiMod.num(target)} ki strikes clear kar di.`);
      }
      if (sub === 'set') {
        const key = (args[1] || '').toLowerCase();
        const val = (args[2] || '').toLowerCase();
        if (key === 'warnlimit') {
          const n = parseInt(val, 10);
          if (!n || n < 1 || n > 10) return reply('❌ Usage: `.aimod set warnlimit 3` (1-10)');
          aiMod.setGroupCfg(chatId, { warnLimit: n });
          return reply(`✅ Warn limit set: *${n}* strikes par kick.`);
        }
        if (key === 'kick') {
          if (val !== 'on' && val !== 'off') return reply('❌ Usage: `.aimod set kick on|off`');
          aiMod.setGroupCfg(chatId, { kickOn: val === 'on' });
          return reply(`✅ Kick on limit: *${val.toUpperCase()}*`);
        }
        if (key === 'delete') {
          if (val !== 'on' && val !== 'off') return reply('❌ Usage: `.aimod set delete on|off`');
          aiMod.setGroupCfg(chatId, { deleteOn: val === 'on' });
          return reply(`✅ Auto-delete: *${val.toUpperCase()}*`);
        }
        return reply('❌ Usage: `.aimod set warnlimit <n>` / `.aimod set kick on|off` / `.aimod set delete on|off`');
      }
      return reply('❌ *Invalid option!*\n\nAvailable options:\n- on\n- off\n- status\n- reset');
    }
  }
] };
