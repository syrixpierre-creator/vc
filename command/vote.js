/**
 * QUEEN AKUMA v3.4.0 — .vote (Levanter #8)
 * .vote <sawal> | <opt1> | <opt2> | <opt3> — vote start (admin/owner)
 * .vote 1 / .vote <option> — vote dalo (har member, ek vote, badal sakte ho)
 * .vote results — tally | .vote end — band karo + winner (admin/owner)
 */
const vote = require('../lib/vote');
const num = (j) => String(j || '').split(':')[0].split('@')[0];

async function isAdminOrOwner(sock, chatId, senderJid) {
  try {
    const isOwner = require('../lib/isOwner');
    if (isOwner.isOwnerOnly && isOwner.isOwnerOnly(senderJid)) return true;
    if (await isOwner(senderJid, sock, chatId)) return true;
  } catch (_) {}
  try {
    const meta = await sock.groupMetadata(chatId);
    const me = (meta.participants || []).find((p) => String(p.id).replace(/\D/g, '').endsWith(num(senderJid).slice(-10)));
    return !!(me && (me.admin === 'admin' || me.admin === 'superadmin'));
  } catch (_) { return false; }
}

module.exports = {
  command: 'vote', aliases: ['groupvote', 'pollvote'], category: 'group',
  description: 'Group me vote karwao — members vote dalte hain',
  usage: '.vote <sawal> | <opt1> | <opt2> | .vote 1 | .vote results | .vote end',
  groupOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const senderJid = message.key.participant || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const raw = (args || []).join(' ').trim();
    const sub = (args[0] || '').toLowerCase();

    if (sub === 'results' || sub === 'result') {
      const r = vote.results(chatId);
      if (!r) return reply('❌ *No vote running.*\n📌 *Usage:* .vote <question> | <option> | <option>');
      return reply(`🗳️ *Vote Results*\n\n❓ ${r.vote.question}\nTotal votes: *${r.total}*\n\n${vote.fmt(r.vote, r.counts, r.total)}\n\nVote dalo: \`.vote 1\` ya \`.vote <option>\``);
    }
    if (sub === 'end' || sub === 'close' || sub === 'stop') {
      if (!(await isAdminOrOwner(sock, chatId, senderJid))) return reply('❌ *Only group admins or the bot owner can use this command.*');
      const r = vote.end(chatId);
      if (!r) return reply('❌ *No vote running.*');
      return reply(`🗳️ *Vote khatm!*\n\n❓ ${r.vote.question}\nTotal votes: *${r.total}*\n\n${vote.fmt(r.vote, r.counts, r.total)}\n\n🏆 *Winner: ${r.winner}* (${r.winnerVotes} votes)`);
    }
    if (raw.includes('|')) {
      if (!(await isAdminOrOwner(sock, chatId, senderJid))) return reply('❌ *Only group admins or the bot owner can use this command.*');
      const parts = raw.split('|').map((x) => x.trim()).filter(Boolean);
      const question = parts[0];
      const options = parts.slice(1);
      if (!question || options.length < 2 || options.length > 10) return reply('❌ Usage: `.vote <sawal> | <opt1> | <opt2>` (2-10 options)');
      const res = vote.start(chatId, question, options, senderJid);
      if (!res.ok) return reply('❌ ' + res.error);
      return reply(`🗳️ *Vote shuru!*\n\n❓ ${question}\n\n${options.map((o, i) => `${i + 1}. ${o}`).join('\n')}\n\nVote dalo: \`.vote 1\` ya \`.vote <option>\`\nResults: \`.vote results\` • End: \`.vote end\``);
    }
    // vote cast (number ya option text)
    if (raw) {
      const res = vote.cast(chatId, senderJid, raw);
      if (!res.ok) return reply('❌ ' + res.error);
      return reply(`✅ Vote ${res.changed ? 'badal diya' : 'dal diya'}: *${res.option}*\n\nResults: \`.vote results\``);
    }
    return reply('🗳️ *Vote System*\n\nStart: `.vote Best game? | Ludo | Cricket`\nVote: `.vote 1` ya `.vote Ludo`\nResults: `.vote results`\nEnd: `.vote end`');
  },
};
