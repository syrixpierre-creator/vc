'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .level / .topxp (QUEEN AKUMA XP system).
 * Har message par +5-15 XP (60s cooldown). Level-up par announce.
 * .level — Jimp rank card (local, wecomeapi nahi) + text fallback.
 */
const axios = require('axios');
const { Jimp, loadFont } = require('jimp');
const fonts = require('@jimp/plugin-print/fonts');
const xpLib = require('../lib/xpSystem');
const { mentionedJids } = require('../lib/mediaDl');

function bar(pct, len) {
  const filled = Math.round((pct / 100) * len);
  return ''.repeat(filled) + ''.repeat(Math.max(0, len - filled));
}

async function rankCard(avatarBuf, name, p, rank) {
  const W = 800, H = 260;
  const card = await new Jimp({ width: W, height: H, color: 0x111827ff });
  // accent bar
  const accent = await new Jimp({ width: W, height: 10, color: 0xf59e0bff });
  card.composite(accent, 0, 0);
  if (avatarBuf) {
    try {
      const av = await Jimp.read(avatarBuf);
      av.cover({ w: 150, h: 150 }).circle();
      card.composite(av, 30, 55);
    } catch (e) {}
  }
  const fontBig = await loadFont(fonts.SANS_32_WHITE);
  const fontSmall = await loadFont(fonts.SANS_16_WHITE);
  card.print({ font: fontBig, x: 210, y: 40, text: String(name || 'User').slice(0, 20), maxWidth: 400, maxHeight: 45 });
  card.print({ font: fontSmall, x: 210, y: 95, text: 'Level ' + p.level + '  •  ' + p.role + (rank ? '  •  Rank #' + rank : ''), maxWidth: 560, maxHeight: 25 });
  card.print({ font: fontSmall, x: 210, y: 125, text: 'XP: ' + p.xp.toLocaleString('en-IN') + '  (' + p.into + '/' + p.need + ' next level)', maxWidth: 560, maxHeight: 25 });
  // XP bar: background + filled
  const barBg = await new Jimp({ width: 540, height: 22, color: 0x374151ff });
  card.composite(barBg, 210, 160);
  const fillW = Math.max(4, Math.round(540 * (p.pct / 100)));
  const barFill = await new Jimp({ width: fillW, height: 22, color: 0x22c55eff });
  card.composite(barFill, 210, 160);
  card.print({ font: fontSmall, x: 210, y: 195, text: p.pct + '%  •  ' + p.messages + ' messages', maxWidth: 560, maxHeight: 25 });
  return card.getBuffer('image/png');
}

module.exports = {
  commands: [
    {
      command: 'level',
      aliases: ['lvl', 'xp', 'rank'],
      description: 'Apna ya kisi ka XP level + rank card dikhao.',
      category: 'economy',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const mentioned = mentionedJids(message);
        const quotedSender = message.message && message.message.extendedTextMessage && message.message.extendedTextMessage.contextInfo && message.message.extendedTextMessage.contextInfo.participant;
        const target = (mentioned && mentioned[0]) || quotedSender || message.key.participant || context.senderId;
        const p = xpLib.progress(target);
        const rank = xpLib.rankOf(target);
        const name = String(target).split('@')[0];
        const text = '🏆 *Level Card*\n\n👤 ' + name + '\n⭐ Level: ' + p.level + '  •  ' + p.role + '\n📊 XP: ' + p.xp.toLocaleString('en-IN') + ' (' + p.into + '/' + p.need + ')\n' + bar(p.pct, 20) + ' ' + p.pct + '%\n💬 Messages: ' + p.messages + (rank ? '\n🥇 Global Rank: #' + rank : '');
        try {
          let avatarBuf = null;
          try {
            const avUrl = await sock.profilePictureUrl(target, 'image');
            const r = await axios.get(avUrl, { responseType: 'arraybuffer', timeout: 12000 });
            avatarBuf = Buffer.from(r.data);
          } catch (e) {}
          const png = await rankCard(avatarBuf, name, p, rank);
          await sock.sendMessage(chatId, { image: png, caption: text }, { quoted: message });
        } catch (e) {
          await reply(text);
        }
      }
    },
    {
      command: 'topxp',
      aliases: ['xptop', 'leaderboardxp'],
      description: 'Top 10 XP leaderboard dikhao.',
      category: 'economy',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const board = xpLib.leaderboard(10);
        if (!board.length) {
          await sock.sendMessage(chatId, { text: '📊 *Nobody has XP yet.*' }, { quoted: message });
          return;
        }
        const medals = ['🥇', '🥈', '🥉'];
        const lines = board.map((e, i) =>
          (medals[i] || (i + 1) + '.') + ' ' + e.num + ' — Lvl ' + e.level + ' • ' + e.xp.toLocaleString('en-IN') + ' XP');
        await sock.sendMessage(chatId, { text: '🏆 *XP Leaderboard (Top 10)*\n\n' + lines.join('\n') }, { quoted: message });
      }
    }
  ],
  // Har message par XP (60s cooldown, lib me)
  async onMessage(sock, message, context = {}) {
    try {
      if (!message || !message.key) return;
      const sender = message.key.participant || message.key.remoteJid;
      if (!sender || String(sender).includes('status@broadcast')) return;
      const m = message.message || {};
      const text = m.conversation || (m.extendedTextMessage && m.extendedTextMessage.text) || (m.imageMessage && m.imageMessage.caption) || (m.videoMessage && m.videoMessage.caption) || '';
      if (!text && !m.imageMessage && !m.videoMessage && !m.audioMessage && !m.stickerMessage) return;
      const gain = 5 + Math.floor(Math.random() * 11); // 5-15 XP
      const res = xpLib.addXp(sender, gain);
      if (res.leveledUp) {
        const chatId = message.key.remoteJid;
        const p = xpLib.progress(sender);
        try {
          await sock.sendMessage(chatId, { text: '🎉 *LEVEL UP!* 🎉\n\n👤 ' + String(sender).split('@')[0] + ' ab *Level ' + res.newLevel + '* par hai!\n🏅 Role: ' + p.role + '\n⭐ Next level: ' + p.need + ' XP chahiye.' });
        } catch (e) {}
      }
    } catch (e) {}
  }
};
