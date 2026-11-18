/**
 * QUEEN AKUMA v3.1.0 — WhatsApp Button Ludo commands
 * .ludo [entry] | .ludo join | .ludo start | .ludo roll | .ludo move <1-4>
 * .ludo board | .ludo leave | .ludo end | .ludostats
 * Buttons se bhi khela ja sakta hai (tap karo, type karne ki zaroorat nahi).
 */
const ludo = require('../lib/ludoGame');

function nameOf(message) {
  const jid = message.key.participant || message.key.remoteJid;
  return message.pushName || String(jid).split('@')[0].replace(/:\d+$/, '').slice(-10);
}

module.exports = { commands: [
  {
    command: 'ludo',
    aliases: ['ludoboard'],
    category: 'games',
    description: 'WhatsApp Button Ludo — board, dice, goti, coins',
    usage: '.ludo [entry] | .ludo join | .ludo start | .ludo roll | .ludo move <1-4>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const senderJid = message.key.participant || message.key.remoteJid;
      const myName = nameOf(message);
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const sub = (args[0] || '').toLowerCase();

      if (sub === 'join') {
        const r = ludo.joinGame(chatId, senderJid, myName);
        if (!r.ok) return reply('❌ ' + r.error);
        return ludo.sendBoard(sock, chatId, r.game, `🙋 *${myName}* join ho gaya! (${r.game.players.length}/4)`, message);
      }
      if (sub === 'start') {
        const r = ludo.startGame(chatId, senderJid);
        if (!r.ok) return reply('❌ ' + r.error);
        return ludo.sendBoard(sock, chatId, r.game, `️ *Game shuru!* ${ludo.EMOJI[r.game.players[0].color]} ${r.game.players[0].name} pehle roll karega.`, message);
      }
      if (sub === 'roll') {
        const r = ludo.rollDice(chatId, senderJid);
        if (!r.ok) return reply('❌ ' + r.error);
        return ludo.sendBoard(sock, chatId, r.game, r.msg || '', message);
      }
      if (sub === 'move') {
        const ti = parseInt(args[1], 10) - 1;
        if (isNaN(ti) || ti < 0 || ti > 3) return reply('❌ Usage: `.ludo move 1` (goti 1-4)');
        const r = ludo.moveToken(chatId, senderJid, ti);
        if (!r.ok) return reply('❌ ' + r.error);
        await ludo.sendBoard(sock, chatId, r.game, r.msg || '', message);
        if (r.won) await ludo.handleButton(sock, message, { chatId, buttonId: 'ludo_board' }).catch(() => {});
        return;
      }
      if (sub === 'board') {
        const game = ludo.getGame(chatId);
        if (!game) return reply('❌ Is chat me koi Ludo game nahi hai. `.ludo` se banao.');
        return ludo.sendBoard(sock, chatId, game, '', message);
      }
      if (sub === 'leave') {
        const r = ludo.leaveGame(chatId, senderJid);
        if (!r.ok) return reply('❌ ' + r.error);
        if (r.empty) return reply('👋 Sab chale gaye, game khatm.');
        return ludo.sendBoard(sock, chatId, r.game, `👋 *${myName}* game se nikal gaya.`, message);
      }
      if (sub === 'end') {
        const r = ludo.endGame(chatId, senderJid);
        if (!r.ok) return reply('❌ ' + r.error);
        return reply(`🛑 Game end kar diya.${r.refunded ? ' Entry fee refund kar di.' : ''}`);
      }
      if (sub === 'help') {
        return reply(`🎲 *QUEEN AKUMA Ludo — kaise khele*\n\n\`.ludo\` — naya game banao (lobby)\n\`.ludo 100\` — 100 coins entry wala game\n\`.ludo join\` — game me join karo (2-4 players)\n\`.ludo start\` — game shuru karo\n\`.ludo roll\` — dice roll karo (ya 🎲 button dabao)\n\`.ludo move 1\` — goti 1 chalao (1-4)\n\`.ludo board\` — board dekho\n\`.ludo leave\` / \`.ludo end\` — niklo / khatm karo\n\`.ludostats\` — wins aur leaderboard\n\n📜 Rules: 6 aaye to goti bahar, kaatne par goti ghar wapas, ★ safe hai, exact number se finish, 3 baar 6 = baari gayi, 2 min me move nahi kiya to baari aage.`);
      }
      // no subcommand: create (entry = number?) or show current game
      const existing = ludo.getGame(chatId);
      if (existing) return ludo.sendBoard(sock, chatId, existing, '', message);
      const entry = /^\d+$/.test(sub) ? parseInt(sub, 10) : 0;
      const r = ludo.createGame(chatId, senderJid, myName, entry);
      if (!r.ok) return reply('❌ ' + r.error);
      return ludo.sendBoard(sock, chatId, r.game, `🎲 *Ludo game ban gaya!*${entry ? `\n💰 Entry: *${entry} coins* — winner ko pot milega!` : '\n💰 Free game — coins nahi lagenge.'}\nDoston ko bolo \`.ludo join\` karein, phir Start dabao.`, message);
    }
  },
  {
    command: 'ludostats',
    aliases: [],
    category: 'games',
    description: 'Ludo wins aur leaderboard dekho',
    usage: '.ludostats',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const senderJid = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const { me, top } = ludo.getStats(senderJid);
      const medals = ['🥇', '🥈', '🥉'];
      const topLines = top.length
        ? top.map((u, i) => `${medals[i] || `${i + 1}.`} @${u.jid} — ${u.wins} wins, ${u.kills} kills`).join('\n')
        : 'Abhi koi record nahi — pehla game khelo!';
      return reply(`🎲 *Ludo Stats*\n\n👤 Tum: *${me.wins} wins* / ${me.games} games / ${me.kills} kills\n\n🏆 *Top Players*\n${topLines}\n\nKhelo: \`.ludo\``);
    }
  }
] };
