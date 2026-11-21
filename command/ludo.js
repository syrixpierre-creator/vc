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
        return ludo.sendBoard(sock, chatId, r.game, `✅ *${myName} joined!* (${r.game.players.length}/4)`, message);
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
        if (!game) return reply('❌ *No Ludo game in this chat.* Start one with .ludo');
        return ludo.sendBoard(sock, chatId, game, '', message);
      }
      if (sub === 'leave') {
        const r = ludo.leaveGame(chatId, senderJid);
        if (!r.ok) return reply('❌ ' + r.error);
        if (r.empty) return reply('👋 Sab chale gaye, game khatm.');
        return ludo.sendBoard(sock, chatId, r.game, `👋 *${myName} left the game.*`, message);
      }
      if (sub === 'end') {
        const r = ludo.endGame(chatId, senderJid);
        if (!r.ok) return reply('❌ ' + r.error);
        return reply(`🛑 Game end kar diya.${r.refunded ? ' Entry fee refund kar di.' : ''}`);
      }
      if (sub === 'help') {
        return reply(`❌ *Invalid option!*\n\nAvailable options:\n- join\n- start\n- roll\n- move <1-4>\n- board\n- leave\n- end`);
      }
      // no subcommand: create (entry = number?) or show current game
      const existing = ludo.getGame(chatId);
      if (existing) return ludo.sendBoard(sock, chatId, existing, '', message);
      const entry = /^\d+$/.test(sub) ? parseInt(sub, 10) : 0;
      const r = ludo.createGame(chatId, senderJid, myName, entry);
      if (!r.ok) return reply('❌ ' + r.error);
      return ludo.sendBoard(sock, chatId, r.game, `🎲 *Ludo game created!*${entry ? `\n💰 Entry: *${entry} coins* (winner takes the pot)` : '\n💰 Free game.'}\nFriends join with .ludo join, then press Start.`, message);
    }
  },
  {
    command: 'ludostats',
    aliases: [],
    category: 'games',
    description: 'Show Ludo wins and leaderboard',
    usage: '.ludostats',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const senderJid = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const { me, top } = ludo.getStats(senderJid);
      const medals = ['🥇', '🥈', '🥉'];
      const topLines = top.length
        ? top.map((u, i) => `${medals[i] || `${i + 1}.`} @${u.jid} — ${u.wins} wins, ${u.kills} kills`).join('\n')
        : 'No records yet, play your first game!';
      return reply(`🎲 *Ludo Stats*\n\n👤 Tum: *${me.wins} wins* / ${me.games} games / ${me.kills} kills\n\n🏆 *Top Players*\n${topLines}\n\nKhelo: \`.ludo\``);
    }
  }
] };
