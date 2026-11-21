/**
 * QUEEN AKUMA v2.8.0 - QUEEN AKUMA port: Fun, News, Canvas, Group, General
 * Live-probed 2026-11-15 (VM se):
 *  Fun: dadjoke (icanhazdadjoke), progjoke (jokeapi.dev), chuck
 *    (chucknorris.io), fact2 (uselessfacts), fox (randomfox),
 *    advice (adviceslip), nasa (NASA APOD, public DEMO_KEY).
 *  News: 14 RSS feeds (BBC/Al Jazeera/Guardian live; CNN VM-block).
 *  Canvas: Xrina windows/quotes (live PNG/JPEG).
 *  Group: groupjid/getgcpp/groupcount/warnlist (Baileys + warnings.json).
 *  General: date/version/whoami. Privacy: QUEEN AKUMA privacy info.
 *  Status: statusdraft/statusideas (local, no API).
 * SKIP (pehle se hain): .news (alias), .joke .catfact .dog .cat
 *  .meme .wiki .trivia .riddle .activity .pokemon .history .numfact
 *  .quote2 .welcome .goodbye .groupinfo .groupstats .admins .tagall
 *  .link .groupname .groupdesc .close .open .antilink .warn .menu
 *  .help .ping .alive .owner .support .time .jid.
 */
const fei = require('../lib/feiApi');
const fs = require('fs');
const path = require('path');

const FAIL = '❌ *API is not responding. Try again later.*';

function make(cmd, aliases, desc, usage, run, extra) {
  const obj = {
    command: cmd, aliases, category: 'fei-misc', description: desc, usage,
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const input = (args || []).join(' ').trim();
      if (!input && !usage.includes('[optional]')) return reply(`❌ Usage: ${usage}`);
      try { await run(sock, chatId, message, input, args, reply, context); }
      catch (e) { await reply('❌ Error: ' + String((e && e.message) || e).slice(0, 200)); }
    },
  };
  if (extra) Object.assign(obj, extra);
  return obj;
}

// ---------------- NEWS (14 RSS feeds) ----------------
const NEWS_SOURCES = Object.freeze({
  aj: { name: 'Al Jazeera', feedUrl: 'https://www.aljazeera.com/xml/rss/all.xml', homeUrl: 'https://www.aljazeera.com' },
  cnn: { name: 'CNN', feedUrl: 'https://rss.cnn.com/rss/edition.rss', homeUrl: 'https://edition.cnn.com' },
  bbc: { name: 'BBC News', feedUrl: 'https://feeds.bbci.co.uk/news/rss.xml', homeUrl: 'https://www.bbc.com/news' },
  gd: { name: 'The Guardian', feedUrl: 'https://www.theguardian.com/world/rss', homeUrl: 'https://www.theguardian.com' },
  npr: { name: 'NPR', feedUrl: 'https://feeds.npr.org/1001/rss.xml', homeUrl: 'https://www.npr.org/sections/news/' },
  nyt: { name: 'New York Times', feedUrl: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', homeUrl: 'https://www.nytimes.com' },
  fox: { name: 'Fox News', feedUrl: 'https://moxie.foxnews.com/google-publisher/latest.xml', homeUrl: 'https://www.foxnews.com' },
  sky: { name: 'Sky News', feedUrl: 'https://feeds.skynews.com/feeds/rss/home.xml', homeUrl: 'https://news.sky.com' },
  dw: { name: 'DW', feedUrl: 'https://rss.dw.com/rdf/rss-en-all', homeUrl: 'https://www.dw.com/en/' },
  f24: { name: 'France 24', feedUrl: 'https://www.france24.com/en/rss', homeUrl: 'https://www.france24.com/en/' },
  wp: { name: 'Washington Post', feedUrl: 'https://feeds.washingtonpost.com/rss/world', homeUrl: 'https://www.washingtonpost.com' },
  toi: { name: 'Times of India', feedUrl: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', homeUrl: 'https://timesofindia.indiatimes.com' },
  punch: { name: 'Punch Nigeria', feedUrl: 'https://punchng.com/feed/', homeUrl: 'https://punchng.com' },
  abc: { name: 'ABC News (US)', feedUrl: 'https://abcnews.go.com/abcnews/topstories', homeUrl: 'https://abcnews.go.com' }
});

function formatArticles(source, articles) {
  const lines = ['📰 *' + source.name.toUpperCase() + '*', ''];
  articles.forEach((a, i) => {
    lines.push((i + 1) + '. *' + a.title + '*');
    if (a.summary) lines.push(a.summary);
    if (a.date) lines.push('🕒 ' + a.date);
    if (a.link) lines.push('🔗 ' + a.link);
    lines.push('');
  });
  lines.push('🔗 ' + source.homeUrl);
  return lines.join('\n').slice(0, 3800);
}

async function runNewsOutlet(sock, chatId, message, code, countArg) {
  const source = NEWS_SOURCES[code];
  if (!source) throw new Error('Unknown news source.');
  let count = 5;
  if (countArg) {
    const n = Number(countArg);
    if (Number.isFinite(n) && n >= 1 && n <= 10) count = Math.floor(n);
  }
  await sock.sendMessage(chatId, { text: '📰 ' + source.name + ' headlines loading…' }, { quoted: message }).catch(() => {});
  const articles = await fei.fetchNews(source, count);
  await sock.sendMessage(chatId, { text: formatArticles(source, articles) }, { quoted: message });
}

const newsCommands = [
  ['aljazeera', 'aj', ['aj']],
  ['cnn', 'cnn', []],
  ['bbc', 'bbc', []],
  ['guardian', 'gd', ['gd']],
  ['npr', 'npr', []],
  ['nytimes', 'nyt', ['nyt']],
  ['foxnews', 'fox', []],
  ['skynews', 'sky', ['sky']],
  ['dw', 'dw', []],
  // 'punch' alias nahi liya - QUEEN AKUMA me .punch pehle se hai
  ['punchnews', 'punch', ['punchng']],
].map(([name, code, aliases]) =>
  make(name, aliases, NEWS_SOURCES[code].name + ' ki latest headlines', '.' + name + ' [count]', async (sock, chatId, message, input, args) => {
    await runNewsOutlet(sock, chatId, message, code, args && args[0]);
  })
);

// ---------------- FUN (no-key public APIs) ----------------
const funCommands = [
  make('dadjoke', [], 'Random dad joke (icanhazdadjoke)', '.dadjoke', async (sock, chatId, message, input, args, reply) => {
    const d = await fei.funJson('https://icanhazdadjoke.com/', { Accept: 'application/json' });
    if (!d || !d.joke) return reply(FAIL);
    await reply(fei.box('😂 DAD JOKE', d.joke));
  }),
  make('progjoke', [], 'Programming joke (jokeapi.dev)', '.progjoke', async (sock, chatId, message, input, args, reply) => {
    const d = await fei.funJson('https://v2.jokeapi.dev/joke/Programming?safe-mode');
    if (!d) return reply(FAIL);
    const text = d.type === 'twopart' ? d.setup + '\n' + d.delivery : (d.joke || '');
    if (!text) return reply(FAIL);
    await reply(fei.box('💻 PROGRAMMING JOKE', text));
  }),
  make('chuck', [], 'Chuck Norris joke', '.chuck', async (sock, chatId, message, input, args, reply) => {
    const d = await fei.funJson('https://api.chucknorris.io/jokes/random');
    if (!d || !d.value) return reply(FAIL);
    await reply(fei.box('🥋 CHUCK NORRIS', d.value));
  }),
  make('fact2', [], 'Random useless fact', '.fact2', async (sock, chatId, message, input, args, reply) => {
    const d = await fei.funJson('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
    if (!d || !d.text) return reply(FAIL);
    await reply(fei.box('🧠 USELESS FACT', d.text));
  }),
  make('fox', [], 'Random fox photo (randomfox)', '.fox', async (sock, chatId, message, input, args, reply) => {
    const d = await fei.funJson('https://randomfox.ca/floof/');
    if (!d || !d.image) return reply(FAIL);
    await sock.sendMessage(chatId, { image: { url: d.image }, caption: '🦊 *Random Fox*\n' + (d.link || '') }, { quoted: message });
  }),
  make('advice', [], 'Random life advice (adviceslip)', '.advice', async (sock, chatId, message, input, args, reply) => {
    const d = await fei.funJson('https://api.adviceslip.com/advice');
    const text = d && d.slip && d.slip.advice;
    if (!text) return reply(FAIL);
    await reply(fei.box('💡 ADVICE', '“' + text + '”'));
  }),
  make('nasa', [], 'NASA Astronomy Picture of the Day', '.nasa', async (sock, chatId, message, input, args, reply) => {
    const d = await fei.nasaApod();
    if (!d || !d.title) return reply(FAIL);
    const body = '*' + d.title + '*\n📅 ' + (d.date || '') + '\n\n' + fei.cleanText(d.explanation, 1200) + (d.url ? '\n\n🔗 ' + d.url : '');
    await reply(fei.box('🚀 NASA APOD', body));
    if (d.media_type === 'image' && d.url) {
      await sock.sendMessage(chatId, { image: { url: d.url }, caption: '🚀 *' + d.title + '*' }, { quoted: message }).catch(() => {});
    }
  }),
];

// ---------------- CANVAS (Xrina, live verify) ----------------
const canvasCommands = [
  make('wndwqute', [], 'Windows-style quote canvas banao', '.wndwqute <quote>', async (sock, chatId, message, input, args, reply) => {
    const quote = input.replace(/[\r\n]+/g, ' ').trim();
    if (!quote || quote.length > 650) return reply('❌ Usage: .wndwqute <quote> (650 chars tak)');
    const img = await fei.xrinaImage('canvas/windows', { text: quote });
    await sock.sendMessage(chatId, { image: img, caption: '🪟 *WINDOWS QUOTE*\n“' + quote.slice(0, 200) + '”' }, { quoted: message });
  }),
  make('canvasquote', [], 'Make a quote image with author', '.canvasquote <quote> | <author>', async (sock, chatId, message, input, args, reply) => {
    const parts = input.split('|').map(s => s.trim());
    if (parts.length !== 2 || !parts[0] || !parts[1]) return reply('❌ Usage: .canvasquote <quote> | <author>');
    if (parts[0].length > 650 || parts[1].length > 100) return reply('❌ Quote 650 aur author 100 chars tak rakho.');
    const img = await fei.xrinaImage('canvas/quotes', { text: parts[0], name: parts[1] });
    await sock.sendMessage(chatId, { image: img, caption: '✨ *CANVAS QUOTE*\n“' + parts[0].slice(0, 200) + '”\n— ' + parts[1] }, { quoted: message });
  }),
];

// ---------------- GROUP ----------------
const warningsPath = path.join(__dirname, '../data/warnings.json');
function readWarnings() {
  try {
    if (!fs.existsSync(warningsPath)) return {};
    return JSON.parse(fs.readFileSync(warningsPath, 'utf8')) || {};
  } catch (_) { return {}; }
}

const groupCommands = [
  make('groupjid', [], 'Is group ka JID dikhao', '.groupjid', async (sock, chatId, message, input, args, reply) => {
    await reply('👥 *GROUP JID*\n\n' + chatId);
  }, { groupOnly: true }),
  make('getgcpp', [], 'Group ki profile photo dikhao', '.getgcpp', async (sock, chatId, message, input, args, reply) => {
    let url = '';
    try { url = await sock.profilePictureUrl(chatId, 'image'); } catch (_) {}
    if (!url) return reply('❌ *No group profile photo found.*');
    await sock.sendMessage(chatId, { image: { url }, caption: '👥 *Group Profile Photo*' }, { quoted: message });
  }, { groupOnly: true }),
  make('groupcount', [], 'How many members and admins in the group', '.groupcount', async (sock, chatId, message, input, args, reply) => {
    const meta = await sock.groupMetadata(chatId);
    const parts = Array.isArray(meta.participants) ? meta.participants : [];
    const admins = parts.filter(p => p.admin === 'admin' || p.admin === 'superadmin').length;
    await reply(fei.box('👥 GROUP COUNT',
      'Name: ' + (meta.subject || 'Unnamed group') +
      '\nMembers: ' + parts.length +
      '\nAdmins: ' + admins +
      '\n🆔 ' + chatId));
  }, { groupOnly: true }),
  make('warnlist', [], 'Is group ki warnings list dikhao', '.warnlist', async (sock, chatId, message, input, args, reply) => {
    const warnings = readWarnings();
    const groupWarns = (warnings && warnings[chatId]) || {};
    const entries = Object.entries(groupWarns)
      .map(([jid, count]) => ({ jid, count: Number(count) || 0 }))
      .filter(e => e.count > 0)
      .sort((a, b) => b.count - a.count);
    if (!entries.length) return reply('✅ *Nobody has a warning in this group.*');
    const lines = entries.map((e, i) => (i + 1) + '. @' + e.jid.split('@')[0] + ' — ⚠️ ' + e.count + '/3');
    await sock.sendMessage(chatId, {
      text: fei.box('⚠️ WARNINGS LIST', lines.join('\n') + '\n\n3 warnings = auto-kick'),
      mentions: entries.map(e => e.jid)
    }, { quoted: message });
  }, { groupOnly: true }),
];

// ---------------- GENERAL ----------------
const generalCommands = [
  make('date', [], 'Aaj ki date aur time (IST)', '.date', async (sock, chatId, message, input, args, reply) => {
    const now = new Date();
    const date = now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    const time = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    await reply(fei.box('📅 DATE & TIME', date + '\n⏰ ' + time + ' (IST)'));
  }),
  make('version', [], 'Bot ka version dikhao', '.version', async (sock, chatId, message, input, args, reply) => {
    let v = 'unknown';
    try { v = require('../package.json').version || v; } catch (_) {}
    await reply(fei.box('🤖 QUEEN AKUMA', 'Version: *v' + v + '*\nChannel: INCONNU BOY SENSEI\nOwner: INCONNU BOY SENSEI'));
  }),
  make('whoami', [], 'Apni details dikhao (number, JID, role)', '.whoami', async (sock, chatId, message, input, args, reply, context) => {
    const senderId = (context && context.senderId) || message.key.participant || message.key.remoteJid || '';
    const num = String(senderId).split('@')[0].split(':')[0];
    const name = message.pushName || '';
    const role = (context && context.senderIsOwnerOrSudo) ? 'Owner/Sudo 👑'
      : (context && context.isSenderAdmin) ? 'Group Admin 🛡️' : 'User 👤';
    await reply(fei.box('👤 WHO AM I',
      (name ? 'Name: ' + name + '\n' : '') +
      'Number: +' + num +
      '\nJID: ' + senderId +
      '\nRole: ' + role +
      '\nChat: ' + (context && context.isGroup ? 'Group 👥' : 'DM 💬')));
  }),
];

// ---------------- PRIVACY + STATUS TOOLS ----------------
const STATUS_IDEAS = Object.freeze({
  general: [
    'One step at a time. Progress is still progress.',
    'Protect your peace and keep building.',
    'A little consistency goes a long way.'
  ],
  motivation: [
    'Your future is shaped by what you do today.',
    'Keep showing up, even when progress feels quiet.',
    'Small wins are still wins. Celebrate them.'
  ],
  gratitude: [
    'Grateful for the lessons, the growth and another chance.',
    'A thankful heart sees value in the little things.',
    'Today, I choose to notice the good.'
  ],
  weekend: [
    'Rest is part of the plan, not a distraction from it.',
    'Slow down, recharge and enjoy the little moments.',
    'A fresh weekend, a fresh chance to reset.'
  ]
});

const extraCommands = [
  make('privacy', [], 'QUEEN AKUMA ki privacy safeguards', '.privacy', async (sock, chatId, message, input, args, reply) => {
    await reply([
      '🔒 *QUEEN AKUMA PRIVACY*',
      '',
      '• This bot does not collect group chat history.',
      '• Message commands only run when someone uses them.',
      '• Anti-delete is OFF by default.',
      '• Anti-delete never caches view-once messages.',
      '• Welcome/goodbye greetings OFF rehte hain by default.',
      '• Auto status view/react owner-controlled hai.',
      '• .vv only works when you reply to a view-once message.'
    ].join('\n'));
  }),
  make('statusdraft', [], 'Format your text as a status draft', '.statusdraft <text>', async (sock, chatId, message, input, args, reply) => {
    const text = input.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim();
    if (!text) return reply('❌ Usage: .statusdraft <apna status text>');
    if (text.length > 700) return reply('❌ Status draft 700 characters tak rakho.');
    await reply('📱 *STATUS DRAFT*\n\n' + text + '\n\n_Ready to copy into your WhatsApp status._');
  }),
  make('statusideas', [], 'Get status ideas (theme: general/motivation/gratitude/weekend)', '.statusideas [theme]', async (sock, chatId, message, input, args, reply) => {
    const theme = (input || 'general').trim().toLowerCase();
    const list = STATUS_IDEAS[theme];
    if (!list) return reply('❌ Theme chuno: general, motivation, gratitude ya weekend.');
    const pool = list.slice();
    const selected = [];
    while (pool.length && selected.length < 3) selected.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    await reply('💡 *STATUS IDEAS — ' + theme.toUpperCase() + '*\n\n' +
      selected.map((line, i) => (i + 1) + '. ' + line).join('\n'));
  }),
];

module.exports = {
  commands: [
    ...newsCommands,
    ...funCommands,
    ...canvasCommands,
    ...groupCommands,
    ...generalCommands,
    ...extraCommands,
  ],
};
