'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .footballnews (QUEEN AKUMA port).
 * Football headlines. Source 1: BBC Sport Football RSS — Source 2: ESPN.
 * Free, no key. cheerio xmlMode se parse.
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
  command: 'footballnews',
  aliases: ['football', 'footynews'],
  description: 'Latest football headlines dikhao (BBC + ESPN).',
  category: 'tools',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    let items = [];
    try { items = items.concat(await fetchRss('https://feeds.bbci.co.uk/sport/football/rss.xml', 'BBC')); } catch (e) {}
    if (items.length < 3) {
      try { items = items.concat(await fetchRss('https://www.espn.com/espn/latestnews/story?page=soccer', 'ESPN')); } catch (e) {}
      if (!items.length) {
        try { items = items.concat(await fetchRss('https://www.espn.in/espn/rss/soccer/news', 'ESPN')); } catch (e) {}
      }
    }
    if (!items.length) {
      await reply('❌ Football news nahi mili — RSS down ho sakte hain. Thodi der baad try karo.');
      return;
    }
    const lines = items.slice(0, 5).map((it, i) =>
      (i + 1) + '. *' + it.title + '*\n   [' + it.source + '] ' + (it.date ? it.date.slice(0, 16) : '') + '\n   ' + it.link);
    await reply('⚽ *Football News*\n\n' + lines.join('\n\n'));
  }
};
