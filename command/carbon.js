'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .carbon (QUEEN AKUMA port).
 * Code se pretty image. API: carbonara.solopov.dev/api/cook (free, no key).
 * Fallback: local Jimp code card (dark panel + code text) — koi API nahi.
 */
const axios = require('axios');
const { Jimp, loadFont } = require('jimp');
const fonts = require('@jimp/plugin-print/fonts');

async function jimpCode(code) {
  const lines = String(code || '').split('\n').slice(0, 18);
  const h = 60 + lines.length * 28;
  const card = await new Jimp({ width: 800, height: Math.max(200, h), color: 0x1f816dff });
  const panel = await new Jimp({ width: 760, height: Math.max(160, h - 40), color: 0x0d1117ff });
  card.composite(panel, 20, 20);
  const font = await loadFont(fonts.SANS_16_WHITE);
  card.print({ font, x: 36, y: 34, text: lines.join('\n'), maxWidth: 728, maxHeight: Math.max(140, h - 60) });
  return card.getBuffer('image/png');
}

module.exports = {
  command: 'carbon',
  aliases: ['codeimg', 'codeshot'],
  description: 'Make a pretty image from code: .carbon <code>',
  category: 'tools',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const code = (args || []).join(' ');
    if (!code) {
      await reply('❌ Usage: *.carbon <code>*\nExample: .carbon console.log("hello")');
      return;
    }
    try {
      const res = await axios.post('https://carbonara.solopov.dev/api/cook',
        { code, backgroundColor: '#1F816D' },
        { responseType: 'arraybuffer', timeout: 20000, maxContentLength: 20 * 1024 * 1024, headers: { 'Content-Type': 'application/json' } });
      const ct = String((res.headers && res.headers['content-type']) || '');
      if (ct.indexOf('image') !== -1 && res.data && res.data.length > 1000) {
        await sock.sendMessage(chatId, { image: Buffer.from(res.data), caption: '💻 Code image' }, { quoted: message });
        return;
      }
      throw new Error('bad response');
    } catch (e) {}
    try {
      const png = await jimpCode(code);
      await sock.sendMessage(chatId, { image: png, caption: '💻 Code image' }, { quoted: message });
    } catch (e) {
      await reply('❌ Carbon image nahi ban paya: ' + String(e.message || e).slice(0, 120));
    }
  }
};
