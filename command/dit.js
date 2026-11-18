'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .dit / .itta (YESSER port).
 * French / Japanese TTS shortcut. gTTS (deps me hai) — voice note bhejta hai.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

function ttsSave(text, lang) {
  return new Promise((resolve, reject) => {
    const gtts = require('gtts');
    const out = path.join(os.tmpdir(), 'demon-tts-' + Date.now() + '-' + Math.floor(Math.random() * 10000) + '.mp3');
    try {
      const t = new gtts(text, lang);
      t.save(out, (err) => {
        if (err) return reject(err);
        resolve(out);
      });
    } catch (e) { reject(e); }
  });
}

async function handle(sock, message, args, lang, label) {
  const chatId = message.key.remoteJid;
  const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
  const text = (args || []).join(' ').trim();
  if (!text) {
    await reply('❌ Text do.\nExample: *.' + (lang === 'fr' ? 'dit Bonjour' : 'itta Konnichiwa') + '*');
    return;
  }
  if (text.length > 200) {
    await reply('❌ Text 200 characters se zyada lamba hai. Chhota text do.');
    return;
  }
  let out = null;
  try {
    out = await ttsSave(text, lang);
    const buf = fs.readFileSync(out);
    await sock.sendMessage(chatId, { audio: buf, mimetype: 'audio/mpeg', ptt: true }, { quoted: message });
  } catch (e) {
    await reply('❌ ' + label + ' voice nahi ban paya: ' + String(e.message || e).slice(0, 120));
  } finally {
    try { if (out && fs.existsSync(out)) fs.unlinkSync(out); } catch (e) {}
  }
}

module.exports = {
  commands: [
    {
      command: 'dit',
      aliases: ['frenchtts', 'parle'],
      description: 'French TTS voice note: .dit <french text>',
      category: 'fun',
      handler: async (sock, message, args, context) => handle(sock, message, args, 'fr', 'French')
    },
    {
      command: 'itta',
      aliases: ['japanesetts', 'nihongo'],
      description: 'Japanese TTS voice note: .itta <japanese text>',
      category: 'fun',
      handler: async (sock, message, args, context) => handle(sock, message, args, 'ja', 'Japanese')
    }
  ]
};
