/**
 * QUEEN AKUMA v3.0.0 — .vision : AI Vision (Gemini 2.0 Flash)
 * Photo bhejo, bot batayega usme kya hai + sawal ka jawab dega.
 * Usage: photo par reply karke `.vision` ya `.vision isme kya hai?`
 * Needs: GEMINI_API_KEY env (free: aistudio.google.com/app/apikey)
 */
const https = require('https');

function geminiVision(key, base64, mime, question, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{ parts: [
        { inline_data: { mime_type: mime || 'image/jpeg', data: base64 } },
        { text: question }
      ] }]
    });
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: '/v1beta/models/gemini-2.0-flash:generateContent?key=' + encodeURIComponent(key),
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      timeout,
    }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          const text = j?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('');
          if (text) return resolve(text);
          reject(new Error((j && j.error && j.error.message) || 'Gemini se jawab nahi mila'));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Gemini timeout')); });
    req.write(body);
    req.end();
  });
}

module.exports = {
  command: 'vision',
  aliases: ['seepic', 'whatsinpic'],
  category: 'ai',
  description: 'Photo ko AI se samjho — describe karo ya sawal puchho',
  usage: '.vision [sawal] (photo par reply karo)',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const key = process.env.GEMINI_API_KEY || '';
    if (!key) {
      return reply('❌ *AI Vision ke liye Gemini key chahiye.*\n\n1. https://aistudio.google.com/app/apikey se FREE key lo\n2. `.env` me daalo: `GEMINI_API_KEY=<redacted>\n3. Bot restart karo, phir photo par reply karke `.vision` likho.');
    }
    // Photo: khud ke message me image, ya quoted image
    const ctx = message.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;
    let target = null;
    let mime = 'image/jpeg';
    if (message.message?.imageMessage) {
      target = { message: { imageMessage: message.message.imageMessage }, key: message.key };
      mime = message.message.imageMessage.mimetype || mime;
    } else if (quoted?.imageMessage) {
      target = { message: { imageMessage: quoted.imageMessage }, key: { remoteJid: chatId, id: ctx.stanzaId, participant: ctx.participant } };
      mime = quoted.imageMessage.mimetype || mime;
    }
    if (!target) {
      return reply('❌ *Photo nahi mili!*\n\nKisi photo par reply karke likho:\n`.vision`\nYa sawal ke saath:\n`.vision is photo me kya hai?`');
    }
    const question = (args || []).join(' ').trim()
      || 'Is photo ko detail me describe karo — kya dikh raha hai, log, cheezein, rang, mood. Hinglish me jawab do.';
    await reply('👁️ *Photo dekh raha hoon...*');
    try {
      const { downloadMediaMessage } = require('@whiskeysockets/baileys');
      const buf = await downloadMediaMessage(target, 'buffer', {}, { reuploadRequest: sock.updateMediaMessage });
      if (!buf || buf.length > 4 * 1024 * 1024) return reply('❌ Photo bahut badi hai (4MB se kam rakho).');
      const ans = await geminiVision(key, buf.toString('base64'), mime, question);
      return reply('👁️ *AI Vision*\n\n' + String(ans).slice(0, 3500));
    } catch (e) {
      return reply('❌ Vision error: ' + String((e && e.message) || e).slice(0, 300));
    }
  }
};
