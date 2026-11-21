'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .base64 REAL implementation.
 * Pehle ye sirf restored wrapper (smartRun fallback) tha — ab real hai.
 * Usage: .base64 encode <text> | .base64 decode <base64> | .base64 <text> (auto)
 */
module.exports = {
  command: 'base64',
  aliases: ['b64'],
  category: 'tools',
  description: 'Base64 encode/decode karo (real).',
  usage: '.base64 encode <text> | .base64 decode <base64>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const all = (args || []).join(' ').trim();
    if (!all) {
      await reply('❌ Usage: *.base64 encode <text>* ya *.base64 decode <base64>*\nExample: .base64 encode hello');
      return;
    }
    const first = String((args || [])[0] || '').toLowerCase();
    if (first === 'encode' || first === 'e' || first === 'enc') {
      const text = (args || []).slice(1).join(' ');
      if (!text) { await reply('📌 *Usage:* .base64 encode <text>'); return; }
      await reply('🔒 *Base64:*\n' + Buffer.from(text, 'utf8').toString('base64'));
      return;
    }
    if (first === 'decode' || first === 'd' || first === 'dec') {
      const b64 = (args || []).slice(1).join(' ').replace(/\s/g, '');
      if (!b64) { await reply('📌 *Usage:* .base64 decode <base64>'); return; }
      try {
        await reply('🔓 *Decoded:*\n' + Buffer.from(b64, 'base64').toString('utf8'));
      } catch (e) {
        await reply('❌ *Invalid base64.*');
      }
      return;
    }
    // Auto: base64 jaisa lage to decode, warna encode
    const clean = all.replace(/\s/g, '');
    if (/^[A-Za-z0-9+/=]{8,}$/.test(clean)) {
      try {
        const dec = Buffer.from(clean, 'base64');
        if (dec.toString('base64').replace(/=+$/, '') === clean.replace(/=+$/, '')) {
          await reply('🔓 *Decoded (auto):*\n' + dec.toString('utf8'));
          return;
        }
      } catch (e) {}
    }
    await reply('🔒 *Base64 (auto-encode):*\n' + Buffer.from(all, 'utf8').toString('base64'));
  }
};
