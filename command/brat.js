/**
 * QUEEN AKUMA • .brat — brat-style green sticker (offline, Jimp se banta hai).
 * Pehle sirf stub tha. Text ko 512x512 brat-green (#8ACE00) image par
 * likh kar sticker banata hai. Koi API key nahi chahiye.
 */
const settings = require('../settings');

async function makeBratImage(text) {
  const JimpMod = require('jimp');
  const Jimp = JimpMod.Jimp || JimpMod.default || JimpMod;
  const img = await new Promise((resolve, reject) => {
    try {
      const im = new Jimp(512, 512, 0x8ACE00FF, (err, image) => (err ? reject(err) : resolve(image)));
      if (im && typeof im.then === 'function') im.then(resolve, reject);
    } catch (e) { reject(e); }
  });
  let font = null;
  try {
    const fontPath = Jimp.FONT_SANS_64_BLACK || (JimpMod && JimpMod.FONT_SANS_64_BLACK);
    if (fontPath) font = await Jimp.loadFont(fontPath);
  } catch {}
  const lines = [];
  const words = String(text).split(/\s+/);
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > 14) { lines.push(line.trim()); line = w; }
    else line = (line + ' ' + w).trim();
  }
  if (line) lines.push(line.trim());
  const shown = lines.slice(0, 4).join('\n');
  if (font) {
    const w = img.bitmap.width, h = img.bitmap.height;
    const tw = Jimp.measureText(font, shown.split('\n')[0] || '');
    const th = Jimp.measureTextHeight(font, shown, w - 40);
    img.print(font, Math.max(10, (w - tw) / 2 - 40), Math.max(10, (h - th) / 2), { text: shown, alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, w - 40, h - 40);
  }
  try { img.blur(1); } catch {}
  return img.getBufferAsync(Jimp.MIME_PNG || 'image/png');
}

module.exports = {
  command: 'brat',
  aliases: ['bratsticker', 'brattext'],
  category: 'sticker',
  description: 'Make a brat-style green text sticker',
  usage: '.brat <text>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const text = (args || []).join(' ').trim();
    if (!text) return reply('❌ Usage: .brat <text>\nExample: .brat hello demon');
    try {
      const png = await makeBratImage(text);
      const { sticker5 } = require('../lib/sticker');
      const webp = await sticker5(png, null, settings.packname || 'QUEEN AKUMA', settings.author || 'INCONNU BOY SENSEI');
      await sock.sendMessage(chatId, { sticker: webp }, { quoted: message });
    } catch (e) {
      await reply('❌ Brat failed: ' + String((e && e.message) || e).slice(0, 200));
    }
  }
};
