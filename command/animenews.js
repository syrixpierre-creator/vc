'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .animenews (QUEEN AKUMA port).
 * Anime news — RSS se. Source 1: Anime News Network — Source 2: MyAnimeList.
 * Free, no key. cheerio xmlMode se parse karta hai.
 */
const axios = require('axios');
const cheerio = require('cheerio');

async function fetchRss(url, source) {
  const res = await axios.get(url, {
    timeout: 20000,
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const $ = cheerio.load(String(res.data || ''), { xmlMode: true });
  const items = [];
  $('item').each((i, el) => {
    if (items.length >= 5) return;
    const title = $(el).find('title').text().trim();
    const link = $(el).find('link').text().trim();
    const date = $(el).find('pubDate').text().trim();
    if (title) items.push({ title, link, date, source });
  });
  if (!items.length) throw new Error(source + ' se news nahi mili');
  return items;
}

module.exports = {
  command: 'animenews',
  aliases: ['anews', 'animenews2'],
  description: 'Latest anime news dikhao (ANN + MAL).',
  category: 'tools',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    let items = [];
    try { items = items.concat(await fetchRss('https://www.animenewsnetwork.com/news/rss.xml', 'ANN')); } catch (e) {}
    if (items.length < 3) {
      try { items = items.concat(await fetchRss('https://myanimelist.net/rss/news.xml', 'MAL')); } catch (e) {}
    }
    if (!items.length) {
      await reply('❌ Anime news nahi mili — dono RSS down ho sakte hain. Thodi der baad try karo.');
      return;
    }
    const lines = items.slice(0, 5).map((it, i) =>
      (i + 1) + '. *' + it.title + '*\n   [' + it.source + '] ' + (it.date ? it.date.slice(0, 16) : '') + '\n   ' + it.link);
    await reply('📰 *Anime News*\n\n' + lines.join('\n\n'));
  }
};
