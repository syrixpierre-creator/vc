 'use strict';
/**
 * QUEEN AKUMA — .4kwallpaper : 4K wallpaper (wallhaven.cc API v1, free, no key, SFW only).
 * VM se live-probed: 200. Usage: .4kwallpaper <query>
 */
async function search(q, atleast) {
  const p = new URLSearchParams({ q, purity: '100', sorting: 'toplist', page: String(1 + Math.floor(Math.random() * 3)) });
  if (atleast) p.set('atleast', atleast);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch('https://wallhaven.cc/api/v1/search?' + p.toString(), { signal: ctrl.signal, headers: { 'User-Agent': 'QUEEN-AKUMA/3.5.0' } });
    if (!res.ok) return [];
    const d = await res.json();
    return Array.isArray(d.data) ? d.data : [];
  } catch (e) { return []; }
  finally { clearTimeout(t); }
}

module.exports = {
  command: '4kwallpaper',
  aliases: [],
  category: 'tools',
  description: '4K wallpaper: .4kwallpaper <query>',
  usage: '.4kwallpaper <query>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const q = (args || []).join(' ').trim();
    if (!q) {
      await reply('🖼️ *4K Wallpaper*\n\nUsage: `.4kwallpaper nature`');
      return;
    }
    let items = await search(q, '3840x2160');
    if (!items.length) items = await search(q, null);
    if (!items.length) {
      await reply('❌ "' + q + '" ke liye koi 4K wallpaper nahi mila.');
      return;
    }
    const it = items[Math.floor(Math.random() * items.length)];
    const caption = '🖼️ *4K Wallpaper*\n' + (it.dimension_x && it.dimension_y ? '📐 ' + it.dimension_x + 'x' + it.dimension_y + '\n' : '') + '🔗 ' + (it.url || '');
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(it.path, { signal: ctrl.signal, headers: { 'User-Agent': 'QUEEN-AKUMA/3.5.0' } });
      clearTimeout(t);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 5000 && buf.length < 16 * 1024 * 1024) {
          await sock.sendMessage(chatId, { image: buf, caption }, { quoted: message });
          return;
        }
      }
    } catch (e) { /* fall through to link reply */ }
    await reply(caption + '\n🖼️ Image: ' + it.path);
  },
};
