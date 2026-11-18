/**
 * QUEEN AKUMA v2.6.1 - public no-key APIs (hunted + user-pasted code se)
 * Live-probed 2026-11-14. Naam takrao se bachne ke liye naye naam hain
 * (.meme/.translate/.wiki/.quote/.joke pehle se registered hain).
 * .aimg <prompt>        - AI image (Pollinations, no key)
 * .aitxt <sawal>        - AI text (Pollinations, no key; Elite/Gemini ke baad fallback)
 * .ptranslate <lang> <text> - translate (MyMemory, default hi)
 * .pmeme                - random meme (meme-api)
 * .shorturl <link>      - link chhota karo (TinyURL)
 * .pwiki <topic>        - Wikipedia summary
 * .pquote               - random quote (Quotable)
 * .pjoke                - random joke (Popcat)
 * .ptts <text>          - text to speech audio (Laurine)
 * v2.6.2 (GitHub hunt, live 2026-11-14): .pchat (ch.at AI), .pjoke2,
 * .pquote2, .pfact, .ptrivia, .psyn, .pweather2, .pqr, .pcurrency,
 * .pcrypto, .pmemes, .pip, .pcolor, .pcapital, .pcountry, .pshort2,
 * .pscore, .panime, .pdcfact. (joke2/quote2 naam pehle se the, isliye
 * p- prefix wale naam liye gaye.)
 */
const pub = require('../lib/publicApis');

function make(cmd, aliases, desc, usage, run) {
  return {
    command: cmd, aliases, category: 'publicapi', description: desc, usage,
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const input = (args || []).join(' ').trim();
      if (!input && !usage.includes('[optional]')) return reply(`❌ Usage: ${usage}`);
      try { await run(sock, chatId, message, input, args, reply); }
      catch (e) { await reply('❌ API error: ' + String((e && e.message) || e).slice(0, 200)); }
    },
  };
}

const FAIL = '❌ API abhi jawab nahi de rahi. Thodi der baad try karo.';

module.exports = {
  commands: [
    make('aimg', ['aiimg', 'pimg'], 'AI image banao (no key)', '.aimg <prompt>', async (sock, chatId, message, input) => {
      await sock.sendMessage(chatId, { text: '🎨 Image ban rahi hai…' }, { quoted: message }).catch(() => {});
      const buf = await pub.pollinationsImage(input);
      if (!buf) return sock.sendMessage(chatId, { text: FAIL }, { quoted: message });
      await sock.sendMessage(chatId, { image: buf, caption: `🎨 *${input.slice(0, 200)}*\n_Pollinations AI_` }, { quoted: message });
    }),
    make('aitxt', ['aitext', 'ptxt'], 'AI se jawab lo (no key)', '.aitxt <sawal>', async (sock, chatId, message, input, args, reply) => {
      // Pehle Elite AI try karo (verified), phir Pollinations, phir Shizo fallback
      let ans = null;
      try {
        const { call } = require('../lib/eliteApi');
        const d = await call('talkai', input);
        ans = d && (d.response || d.text || d.result);
      } catch (_) {}
      if (!ans) ans = await pub.pollinationsText(input);
      if (!ans) ans = await pub.shizoChat(input);
      if (!ans) return reply(FAIL);
      return reply(`🤖 *AI*\n\n${String(ans).slice(0, 3000)}`);
    }),
    make('ptranslate', ['ptr'], 'Text translate karo (MyMemory)', '.ptranslate <lang> <text>', async (sock, chatId, message, input, args, reply) => {
      let to = 'hi';
      let text = input;
      if (args.length >= 2 && /^[a-z]{2}(-[a-z]{2})?$/i.test(args[0])) { to = args[0].toLowerCase(); text = args.slice(1).join(' '); }
      const out = await pub.translateMyMemory(text, to);
      if (!out) return reply(FAIL);
      return reply(`🌐 *Translate (${to})*\n\n${out}`);
    }),
    make('pmeme', ['pubmeme'], 'Random meme', '.pmeme [optional]', async (sock, chatId, message) => {
      const m = await pub.getMeme();
      if (!m) return sock.sendMessage(chatId, { text: FAIL }, { quoted: message });
      await sock.sendMessage(chatId, { image: { url: m.url }, caption: `😂 *${m.title}*` }, { quoted: message });
    }),
    make('shorturl', ['short', 'tinyurl'], 'Link chhota karo', '.shorturl <link>', async (sock, chatId, message, input, args, reply) => {
      if (!/^https?:\/\//i.test(input)) return reply('❌ Sahi link do.\nUsage: `.shorturl https://example.com`');
      const s = await pub.shortUrl(input);
      if (!s) return reply(FAIL);
      return reply(`🔗 *Short URL*\n\n${s}`);
    }),
    make('pwiki', ['pubwiki'], 'Wikipedia summary', '.pwiki <topic>', async (sock, chatId, message, input) => {
      const w = await pub.wikiSummary(input);
      if (!w || !w.extract) return sock.sendMessage(chatId, { text: FAIL }, { quoted: message });
      const caption = `📖 *${w.title}*\n\n${w.extract.slice(0, 1500)}`;
      if (w.thumbnail) {
        try { return await sock.sendMessage(chatId, { image: { url: w.thumbnail }, caption }, { quoted: message }); } catch (_) {}
      }
      await sock.sendMessage(chatId, { text: caption }, { quoted: message });
    }),
    make('pquote', ['pubquote'], 'Random quote', '.pquote [optional]', async (sock, chatId, message, _i, _a, reply) => {
      const q = await pub.getQuote();
      if (!q) return reply(FAIL);
      return reply(`💬 *"${q.content}"*\n— ${q.author}`);
    }),
    make('pjoke', ['pubjoke'], 'Random joke', '.pjoke [optional]', async (sock, chatId, message, _i, _a, reply) => {
      const j = await pub.getJoke();
      if (!j) return reply(FAIL);
      return reply(`😂 *Joke*\n\n${j}`);
    }),
    make('ptts', ['pubtts'], 'Text ko audio banao', '.ptts <text>', async (sock, chatId, message, input) => {
      await sock.sendMessage(chatId, { text: '🔊 Audio ban raha hai…' }, { quoted: message }).catch(() => {});
      const url = await pub.laurineTts(input);
      if (!url) return sock.sendMessage(chatId, { text: FAIL + '\n(Laurine TTS is waqt is VM/host se nahi khul rahi)' }, { quoted: message });
      await sock.sendMessage(chatId, { audio: { url }, mimetype: 'audio/mpeg' }, { quoted: message });
    }),
    make('pchat', ['pchatgpt', 'chatat'], 'AI se baat karo (ch.at, no key)', '.pchat <sawal>', async (sock, chatId, message, input, args, reply) => {
      let ans = await pub.chatAt(input);
      if (!ans) { try { const { call } = require('../lib/eliteApi'); const d = await call('talkai', input); ans = d && (d.response || d.text || d.result); } catch (_) {} }
      if (!ans) ans = await pub.pollinationsText(input);
      if (!ans) ans = await pub.shizoChat(input);
      if (!ans) return reply(FAIL);
      return reply(`🤖 *AI*\n\n${String(ans).slice(0, 3000)}`);
    }),
    make('pjoke2', ['pubjoke2'], 'Random joke (JokeAPI)', '.pjoke2 [optional]', async (sock, chatId, message, _i, _a, reply) => {
      const j = await pub.jokeApiDev();
      if (!j) return reply(FAIL);
      return reply(`😂 *Joke*\n\n${j}`);
    }),
    make('pquote2', ['pubquote2'], 'Random quote (ZenQuotes)', '.pquote2 [optional]', async (sock, chatId, message, _i, _a, reply) => {
      const q = await pub.zenQuote();
      if (!q || !q.content) return reply(FAIL);
      return reply(`💬 *"${q.content}"*\n— ${q.author}`);
    }),
    make('pfact', ['pubfact'], 'Random interesting fact', '.pfact [optional]', async (sock, chatId, message, _i, _a, reply) => {
      let f = await pub.uselessFact();
      if (!f) f = await pub.dcFact();
      if (!f) return reply(FAIL);
      return reply(`💡 *Fact*\n\n${f}`);
    }),
    make('ptrivia', ['pubtrivia'], 'Trivia sawal (OpenTDB)', '.ptrivia [optional]', async (sock, chatId, message, _i, _a, reply) => {
      const t = await pub.triviaQuestion();
      if (!t) return reply(FAIL);
      const letters = ['A', 'B', 'C', 'D'];
      const opts = t.options.map((o, i) => `${letters[i]}. ${o}`).join('\n');
      const idx = t.options.indexOf(t.answer);
      return reply(`🧠 *Trivia*${t.category ? ' (' + t.category + ')' : ''}\n\n${t.question}\n\n${opts}\n\n✅ Answer: ${letters[idx] || ''} - ${t.answer}`);
    }),
    make('psyn', ['pubsyn'], 'Synonyms dhoondo (Datamuse)', '.psyn <word>', async (sock, chatId, message, input, args, reply) => {
      const w = await pub.datamuseSyn(input.split(/\s+/)[0]);
      if (!w) return reply(FAIL);
      return reply(`📖 *Synonyms: ${input.split(/\s+/)[0]}*\n\n${w.join(', ')}`);
    }),
    make('pweather2', ['pubweather2'], 'Weather (wttr.in)', '.pweather2 <city>', async (sock, chatId, message, input, args, reply) => {
      const w = await pub.wttrWeather(input);
      if (!w) return reply(FAIL);
      return reply(`🌤️ *${w.city}*\n\n🌡️ ${w.temp}°C (feels ${w.feels}°C)\n☁️ ${w.desc}\n💧 Humidity: ${w.humidity}%\n💨 Wind: ${w.wind} km/h`);
    }),
    make('pqr', ['pubqr', 'pqrcode'], 'QR code banao', '.pqr <text>', async (sock, chatId, message, input) => {
      let buf = await pub.qrBuffer(input);
      if (!buf) buf = await pub.dcQr(input);
      if (!buf) return sock.sendMessage(chatId, { text: FAIL }, { quoted: message });
      await sock.sendMessage(chatId, { image: buf, caption: `🔳 *QR:* ${input.slice(0, 200)}` }, { quoted: message });
    }),
    make('pcurrency', ['pubcurrency', 'pcur'], 'Currency convert (Frankfurter)', '.pcurrency <amount> <from> <to>', async (sock, chatId, message, input, args, reply) => {
      let amount = 1, from = 'USD', to = 'INR';
      if (args.length >= 3 && !isNaN(Number(args[0]))) { amount = Number(args[0]); from = args[1].toUpperCase(); to = args[2].toUpperCase(); }
      else if (args.length === 2) { from = args[0].toUpperCase(); to = args[1].toUpperCase(); }
      const r = await pub.frankfurterRate(amount, from, to);
      if (!r) return reply(FAIL);
      return reply(`💱 *Currency*\n\n${r.amount} ${r.from} = ${r.converted.toFixed(2)} ${r.to}\n(1 ${r.from} = ${r.rate} ${r.to})`);
    }),
    make('pcrypto', ['pubcrypto'], 'Crypto price (CoinGecko)', '.pcrypto <coin>', async (sock, chatId, message, input, args, reply) => {
      const id = (input.split(/\s+/)[0] || 'bitcoin').toLowerCase();
      const c = await pub.cryptoPrice(id);
      if (!c) return reply(FAIL);
      return reply(`🪙 *${id}*\n\n💵 $${c.usd}\n₹ ${c.inr}`);
    }),
    make('pmemes', ['pubmemes'], 'Popular meme templates (Imgflip)', '.pmemes [optional]', async (sock, chatId, message) => {
      const list = await pub.imgflipMemes();
      if (!list || !list.length) return sock.sendMessage(chatId, { text: FAIL }, { quoted: message });
      const text = `😂 *Popular Memes*\n\n` + list.slice(0, 5).map((m, i) => `${i + 1}. ${m.name}\n   ${m.url}`).join('\n');
      try { await sock.sendMessage(chatId, { image: { url: list[0].url }, caption: text }, { quoted: message }); }
      catch (_) { await sock.sendMessage(chatId, { text }, { quoted: message }); }
    }),
    make('pip', ['pubip'], 'IP lookup (ip-api)', '.pip <ip>', async (sock, chatId, message, input, args, reply) => {
      const ip = (input.split(/\s+/)[0] || '').trim();
      const d = await pub.ipLookup(ip);
      if (!d) return reply(FAIL);
      return reply(`🌐 *IP Lookup*\n\n📍 ${d.city || ''}, ${d.region || ''}, ${d.country || ''}\n🏢 ISP: ${d.isp || ''}\n🔢 IP: ${d.query || ip}`);
    }),
    make('pcolor', ['pubcolor'], 'Color info (hex)', '.pcolor <hex>', async (sock, chatId, message, input, args, reply) => {
      const hex = (input.split(/\s+/)[0] || '').trim();
      if (!/^[0-9a-fA-F]{6}$/.test(hex.replace(/^#/, ''))) return reply('❌ 6-digit hex do.\nUsage: `.pcolor ff0000`');
      const c = await pub.colorInfo(hex);
      if (!c) return reply(FAIL);
      return reply(`🎨 *Color*\n\nName: ${c.name}\nHex: ${c.hex}\nRGB: ${c.rgb}`);
    }),
    make('pcapital', ['pubcapital'], 'Country ki capital', '.pcapital <country>', async (sock, chatId, message, input, args, reply) => {
      const cap = await pub.countryCapital(input);
      if (!cap) return reply(FAIL);
      return reply(`🏛️ *${input}*\n\nCapital: *${cap}*`);
    }),
    make('pcountry', ['pubcountry'], 'Country info (WorldBank)', '.pcountry <code>', async (sock, chatId, message, input, args, reply) => {
      const code = (input.split(/\s+/)[0] || '').trim();
      if (!code) return reply('❌ Country code do.\nUsage: `.pcountry IN`');
      const c = await pub.worldbankCountry(code);
      if (!c) return reply(FAIL);
      return reply(`🌍 *${c.name}* (${c.iso})\n\n🏛️ Capital: ${c.capital || '-'}\n📍 Region: ${c.region || '-'}\n💰 Income: ${c.income || '-'}`);
    }),
    make('pshort2', ['pubshort2'], 'Link chhota karo (v.gd)', '.pshort2 <link>', async (sock, chatId, message, input, args, reply) => {
      if (!/^https?:\/\//i.test(input)) return reply('❌ Sahi link do.\nUsage: `.pshort2 https://example.com`');
      const s = await pub.vgdShort(input);
      if (!s) return reply(FAIL);
      return reply(`🔗 *Short URL*\n\n${s}`);
    }),
    make('pscore', ['pubscore'], 'Football scores (ESPN, EPL)', '.pscore [optional]', async (sock, chatId, message, _i, _a, reply) => {
      const list = await pub.espnSoccer();
      if (!list || !list.length) return reply(FAIL);
      const text = `⚽ *Premier League Scores*\n\n` + list.map((m) => `${m.home} ${m.score} ${m.away}${m.status ? ' (' + m.status + ')' : ''}`).join('\n');
      return reply(text);
    }),
    make('panime', ['pubanime'], 'Anime search (David Cyril)', '.panime <name>', async (sock, chatId, message, input, args, reply) => {
      const list = await pub.dcAnime(input);
      if (!list || !list.length) return reply(FAIL);
      const text = `🎌 *Anime: ${input}*\n\n` + list.map((a, i) => `${i + 1}. ${a.title}${a.type ? ' (' + a.type + ')' : ''}${a.score ? ' ⭐ ' + a.score : ''}`).join('\n');
      return reply(text);
    }),
    make('pdcfact', ['pubdcfact'], 'Random fact (David Cyril)', '.pdcfact [optional]', async (sock, chatId, message, _i, _a, reply) => {
      let f = await pub.dcFact();
      if (!f) f = await pub.uselessFact();
      if (!f) return reply(FAIL);
      return reply(`💡 *Fact*\n\n${f}`);
    }),
  ]
};
