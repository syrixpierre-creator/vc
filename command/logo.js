 'use strict';
/**
 * QUEEN AKUMA — .glossysilver : glossy silver text logo (Jimp, local, no API).
 * Usage: .glossysilver <text, max 18 chars>
 */
const { Jimp, loadFont } = require('jimp');
const fonts = require('@jimp/plugin-print/fonts');
const { measureText } = require('@jimp/plugin-print');

module.exports = {
  command: 'glossysilver',
  aliases: [],
  category: 'tools',
  description: 'Glossy silver text logo: .glossysilver <text>',
  usage: '.glossysilver <text>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const text = (args || []).join(' ').trim();
    if (!text) {
      await reply('✨ *Glossy Silver Logo*\n\nUsage: `.glossysilver QUEEN AKUMA`\n(max 18 characters)');
      return;
    }
    if (text.length > 18) {
      await reply('❌ Text bahut lamba hai — max 18 characters.');
      return;
    }
    try {
      const W = 800;
      const H = 360;
      const img = await new Jimp({ width: W, height: H, color: 0x9a9a9aff });
      img.scan(0, 0, W, H, (x, y, idx) => {
        const t = y / H;
        let r = Math.round(237 + (143 - 237) * t);
        let g = Math.round(237 + (143 - 237) * t);
        let b = Math.round(237 + (143 - 237) * t);
        if (y < H * 0.45) {
          const f = (1 - y / (H * 0.45)) * 0.6;
          r = Math.round(r + (255 - r) * f);
          g = Math.round(g + (255 - g) * f);
          b = Math.round(b + (255 - b) * f);
        }
        const d = img.bitmap.data;
        d[idx] = r; d[idx + 1] = g; d[idx + 2] = b; d[idx + 3] = 255;
      });
      const big = text.length <= 10;
      const fontBlack = await loadFont(big ? fonts.SANS_64_BLACK : fonts.SANS_32_BLACK);
      const fontWhite = await loadFont(big ? fonts.SANS_64_WHITE : fonts.SANS_32_WHITE);
      const w = measureText(fontBlack, text);
      const x = Math.max(10, Math.round((W - w) / 2));
      const y = Math.round((H - (big ? 64 : 32)) / 2);
      img.print({ font: fontWhite, x, y: y + 3, text, maxWidth: W - 20, maxHeight: 80 });
      img.print({ font: fontBlack, x, y, text, maxWidth: W - 20, maxHeight: 80 });
      const buf = await img.getBuffer('image/png');
      await sock.sendMessage(chatId, { image: buf, caption: '✨ *Glossy Silver*\n"' + text + '"' }, { quoted: message });
    } catch (e) {
      await reply('❌ Logo ban nahi paya: ' + String(e.message || e).slice(0, 120));
    }
  },
};
