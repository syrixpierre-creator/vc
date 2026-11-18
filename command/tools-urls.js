 'use strict';
/**
 * QUEEN AKUMA — .abellashort : lambi URL ko chhota karo (is.gd primary, tinyurl fallback).
 * Dono free, no key. VM se live-probed: is.gd 200, tinyurl 200.
 * Usage: .abellashort <url>
 */
async function shortIsGd(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch('https://is.gd/create.php?format=json&url=' + encodeURIComponent(url), { signal: ctrl.signal });
    if (!res.ok) return null;
    const d = await res.json();
    return d.shorturl || null;
  } catch (e) { return null; }
  finally { clearTimeout(t); }
}

async function shortTiny(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch('https://tinyurl.com/api-create.php?url=' + encodeURIComponent(url), { signal: ctrl.signal });
    if (!res.ok) return null;
    const txt = (await res.text()).trim();
    return txt.startsWith('http') ? txt : null;
  } catch (e) { return null; }
  finally { clearTimeout(t); }
}

module.exports = {
  command: 'abellashort',
  aliases: [],
  category: 'tools',
  description: 'URL short karo: .abellashort <url>',
  usage: '.abellashort <url>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    let url = (args || [])[0] ? String((args || [])[0]).trim() : '';
    if (!url) {
      await reply('🔗 *Abella Short*\n\nUsage: `.abellashort https://example.com/lambi-url`');
      return;
    }
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    try { new URL(url); } catch (e) {
      await reply('❌ Sahi URL bhejo. Example: `.abellashort https://example.com`');
      return;
    }
    const short = (await shortIsGd(url)) || (await shortTiny(url));
    if (!short) {
      await reply('❌ Short URL nahi ban payi — net check karo ya thodi der baad try karo.');
      return;
    }
    await reply('🔗 *Short URL*\n\n' + short + '\n\nOriginal: ' + url);
  },
};
