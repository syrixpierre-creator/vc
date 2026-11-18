'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .aivoice (XLICON-V2 port).
 * Gemini jawab + gTTS voice note. Dono pieces QUEEN AKUMA me pehle se hain
 * (lib/aiTools.js geminiText + gtts dep).
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { geminiText } = require('../lib/aiTools');

function ttsSave(text, lang) {
  return new Promise((resolve, reject) => {
    const gtts = require('gtts');
    const out = path.join(os.tmpdir(), 'demon-aivoice-' + Date.now() + '.mp3');
    try {
      const t = new gtts(text, lang || 'en');
      t.save(out, (err) => {
        if (err) return reject(err);
        resolve(out);
      });
    } catch (e) { reject(e); }
  });
}

module.exports = {
  command: 'aivoice',
  aliases: ['aivoicenote', 'askvoice'],
  description: 'AI se jawab lo voice note me: .aivoice <sawal> [lang]',
  category: 'ai',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    let lang = 'en';
    let q = (args || []).join(' ').trim();
    const langMatch = q.match(/\s+--lang\s+([a-z]{2})$/i);
    if (langMatch) { lang = langMatch[1].toLowerCase(); q = q.slice(0, langMatch.index).trim(); }
    if (!q) {
      await reply('❌ Sawal do.\nExample: *.aivoice What is photosynthesis?*\nHindi me jawab ke liye: *.aivoice Photosynthesis kya hai? --lang hi*');
      return;
    }
    await reply('⏳ AI soch raha hai, phir voice note bhejta hoon...');
    const res = await geminiText(q, { maxTokens: 600, temperature: 0.7 });
    if (!res.ok) {
      await reply(res.error || '❌ AI jawab nahi de paya.');
      return;
    }
    const answer = res.text.slice(0, 900);
    let out = null;
    try {
      out = await ttsSave(answer, lang);
      const buf = fs.readFileSync(out);
      await sock.sendMessage(chatId, { audio: buf, mimetype: 'audio/mpeg', ptt: true }, { quoted: message });
      await reply('💬 *Text me bhi:*\n' + answer);
    } catch (e) {
      await reply('💬 *AI jawab (voice nahi ban paya):*\n' + answer);
    } finally {
      try { if (out && fs.existsSync(out)) fs.unlinkSync(out); } catch (e) {}
    }
  }
};
