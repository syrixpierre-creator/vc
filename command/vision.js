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
          reject(new Error((j && j.error && j.error.message) || 'No answer from Gemini'));
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
  description: 'Understand a photo with AI: describe it or ask a question',
  usage: '.vision [sawal] (photo par reply karo)',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const key = process.env.GEMINI_API_KEY || '';
    if (!key) {
      return reply('❌ *GEMINI_API_KEY is missing.* Set it in .env and restart the bot.');
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
      return reply('📌 *Usage:* reply to a photo with .vision <question>');
    }
    const question = (args || []).join(' ').trim()
      || 'Describe this photo in detail: what is visible, people, objects, colors, mood. Answer in English.';
    await reply('👁️ *Photo dekh raha hoon...*');
    try {
      const { downloadMediaMessage } = require('@whiskeysockets/baileys');
      const buf = await downloadMediaMessage(target, 'buffer', {}, { reuploadRequest: sock.updateMediaMessage });
      if (!buf || buf.length > 4 * 1024 * 1024) return reply('❌ *Photo is too big (keep it under 4MB).*');
      const ans = await geminiVision(key, buf.toString('base64'), mime, question);
      return reply('👁️ *AI Vision*\n\n' + String(ans).slice(0, 3500));
    } catch (e) {
      return reply('❌ Vision error: ' + String((e && e.message) || e).slice(0, 300));
    }
  }
};
