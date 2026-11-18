'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .deepimg (TKM port).
 * Text se AI image (Flux). Source 1: chatgot preview endpoint (unofficial, fragile).
 * Source 2: Pollinations image (free, no key, stable).
 */
const axios = require('axios');

async function chatgotImage(prompt) {
  const res = await axios.post('https://api-preview.chatgot.io/api/v1/deepimg/flux-1-dev', {
    prompt, size: '1024x1024',
    device_id: 'dev-' + Math.floor(Math.random() * 1000000)
  }, {
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://deepimg.ai',
      Referer: 'https://deepimg.ai/'
    },
    timeout: 90000
  });
  const d = res.data || {};
  const url = d.data && d.data.images && d.data.images[0] && d.data.images[0].url;
  if (!url) throw new Error('chatgot se image nahi mili');
  return url;
}

function pollinationsImage(prompt) {
  return 'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt) +
    '?width=1024&height=1024&nologo=true&seed=' + Math.floor(Math.random() * 1000000);
}

module.exports = {
  command: 'deepimg',
  aliases: ['fluximg', 'flux'],
  category: 'ai',
  description: 'Text se AI image banao (Flux).',
  usage: '.deepimg <prompt>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const prompt = (args || []).join(' ').trim();
    if (!prompt) {
      await reply('❌ Prompt do.\nExample: *.deepimg a cat wearing sunglasses, sunset*');
      return;
    }
    await reply('⏳ Image ban rahi hai: *' + prompt.slice(0, 100) + '* ...');
    try {
      const url = await chatgotImage(prompt);
      await sock.sendMessage(chatId, { image: { url }, caption: '🖼️ *DeepImg (Flux)*\n📜 Prompt: ' + prompt }, { quoted: message });
      return;
    } catch (e) {}
    try {
      const url = pollinationsImage(prompt);
      await sock.sendMessage(chatId, { image: { url }, caption: '🖼️ *DeepImg (Pollinations fallback)*\n📜 Prompt: ' + prompt }, { quoted: message });
    } catch (e) {
      await reply('❌ Image nahi ban payi: ' + String(e.message || e).slice(0, 120) + '\nThodi der baad try karo.');
    }
  }
};
