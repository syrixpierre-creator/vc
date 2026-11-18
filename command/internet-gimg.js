 'use strict';
/**
 * QUEEN AKUMA — .gimg : image search (Openverse API, free, no key).
 * VM se live-probed: 200. Usage: .gimg <query>
 */
async function fetchJson(url, timeoutMs) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'QUEEN-AKUMA/3.5.0' } });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) { return null; }
  finally { clearTimeout(t); }
}

module.exports = {
  command: 'gimg',
  aliases: [],
  category: 'tools',
  description: 'Image search karo: .gimg <query>',
  usage: '.gimg <query>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const q = (args || []).join(' ').trim();
    if (!q) {
      await reply('🖼️ *GImg*\n\nUsage: `.gimg billi`');
      return;
    }
    const d = await fetchJson('https://api.openverse.org/v1/images/?q=' + encodeURIComponent(q) + '&page_size=3', 12000);
    const results = (d && Array.isArray(d.results) ? d.results : []).filter((r) => r && r.url);
    if (!results.length) {
      await reply('❌ "' + q + '" ke liye koi image nahi mili.');
      return;
    }
    const r = results[0];
    const caption = '🖼️ *' + (r.title || q) + '*\n'
      + (r.license ? '📜 License: ' + r.license + '\n' : '')
      + (r.foreign_landing_url ? '🔗 Source: ' + r.foreign_landing_url : '');
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch(r.url, { signal: ctrl.signal, headers: { 'User-Agent': 'QUEEN-AKUMA/3.5.0' } });
      clearTimeout(t);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 5000 && buf.length < 8 * 1024 * 1024) {
          await sock.sendMessage(chatId, { image: buf, caption }, { quoted: message });
          return;
        }
      }
    } catch (e) { /* fall through to link reply */ }
    await reply(caption + '\n🖼️ Image: ' + r.url);
  },
};
