'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .telesticker (QUEEN AKUMA port).
 * Telegram sticker pack se stickers import karo (WhatsApp sticker banao).
 * Official Telegram Bot API — TELEGRAM_BOT_TOKEN chahiye (settings.js ya .env).
 * Static webp stickers convert hote hain (lib/sticker.js). TGS (animated)
 * skip hota hai — WhatsApp TGS support nahi karta.
 */
const axios = require('axios');
const { sticker5 } = require('../lib/sticker');
const settings = require('../settings');

function tgToken() {
  return (settings && (settings.telegramBotToken || settings.telegram_token)) || process.env.TELEGRAM_BOT_TOKEN || '';
}

module.exports = {
  command: 'telesticker',
  aliases: ['tgsticker', 'tgstickers'],
  description: 'Telegram sticker pack import karo: .telesticker <pack name> [count]',
  category: 'tools',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const token = tgToken();
    if (!token) {
      await reply('❌ *TELEGRAM_BOT_TOKEN nahi hai.*\n\n1. @BotFather se bot banao, token lo\n2. settings.js me `telegramBotToken` daalo ya .env me `TELEGRAM_BOT_TOKEN=<token>`\n\nPhir dobara try karo.');
      return;
    }
    let pack = String((args || [])[0] || '').trim().replace(/^https?:\/\/t\.me\/addstickers\//, '').replace(/^\@/, '');
    const count = Math.min(Math.max(parseInt((args || [])[1], 10) || 3, 1), 5);
    if (!pack) {
      await reply('❌ Pack naam do.\nExample: *.telesticker FunnyCats* ya *.telesticker https://t.me/addstickers/FunnyCats*');
      return;
    }
    await reply('⏳ Telegram pack *' + pack + '* se ' + count + ' stickers la raha hoon...');
    try {
      const res = await axios.get('https://api.telegram.org/bot' + token + '/getStickerSet', {
        params: { name: pack }, timeout: 20000
      });
      const set = res.data && res.data.result;
      if (!set || !set.stickers || !set.stickers.length) {
        await reply('❌ Pack nahi mila ya khaali hai: *' + pack + '*');
        return;
      }
      const pack2 = (settings && (settings.packname || settings.packName)) || 'QUEEN AKUMA';
      const author = (settings && settings.author) || 'INCONNU BOY SENSEI';
      let sent = 0, skipped = 0;
      for (const st of set.stickers.slice(0, count)) {
        if (st.is_animated || st.is_video) { skipped++; continue; }
        try {
          const f = await axios.get('https://api.telegram.org/bot' + token + '/getFile', {
            params: { file_id: st.file_id }, timeout: 15000
          });
          const filePath = f.data && f.data.result && f.data.result.file_path;
          if (!filePath) { skipped++; continue; }
          const img = await axios.get('https://api.telegram.org/file/bot' + token + '/' + filePath, {
            responseType: 'arraybuffer', timeout: 20000
          });
          const webp = await sticker5(Buffer.from(img.data), null, pack2, author);
          await sock.sendMessage(chatId, { sticker: webp }, { quoted: message });
          sent++;
        } catch (e) { skipped++; }
      }
      await reply('✅ *' + sent + ' stickers* import ho gaye pack *' + pack + '* se.' + (skipped ? '\n⏭️ ' + skipped + ' skip hue (animated/video ya fail).' : ''));
    } catch (e) {
      const desc = (e.response && e.response.data && e.response.data.description) || e.message;
      await reply('❌ Telegram pack nahi mila: ' + String(desc).slice(0, 150) + '\nPack naam check karo (t.me/addstickers/<name> wala).');
    }
  }
};
