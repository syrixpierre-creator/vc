/**
 * QUEEN AKUMA v2.7.0 - Top 20 missing commands (6-zip check report se)
 * Live-probed 2026-11-14. Sirf wahi commands jo verify karke missing mile
 * aur safely implement ho sake. Skip kiye gaye (report me reason):
 * .gpt5 (malvin-api DEPLOYMENT_NOT_FOUND - dead), .veo3/.sora2 (omegatech
 * unprobed/keyed risk), .clearall (bot ke sent messages ka koi store nahi,
 * delete karne ko kuch nahi), .backupsession (session files chat me bhejna
 * credential-safety risk), .gcbot (exists: .chatbot on/off), .surrender
 * (in-game text already works), .chartest/.mychar (exists: .character),
 * .tiktokstalk2 (exists: Elite .tiktokstalk), .antideletedm (exists:
 * .selfantidelete DM toggle).
 * New: .v2sticker .checkstore .clearstore .sessioninfo .langcodes
 * .detectlang .catfact .technews .gfx1-12 .app/.application
 * .addsudo/.delsudo/.sudohelp
 */
const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const pub = require('../lib/publicApis');
const antidelete = require('./antidelete');
const apkCommand = require('./apk');
const sudoMod = require('./sudo');
let ffmpegPath = 'ffmpeg';
try { ffmpegPath = require('./_xjx/utils/ffmpegPath'); } catch (_) {}

const FAIL = '❌ *API is not responding. Try again later.*';

function make(cmd, aliases, desc, usage, run) {
  return {
    command: cmd, aliases, category: 'advtools', description: desc, usage,
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const input = (args || []).join(' ').trim();
      if (!input && !usage.includes('[optional]')) return reply(`❌ Usage: ${usage}`);
      try { await run(sock, chatId, message, input, args, reply); }
      catch (e) { await reply('❌ Error: ' + String((e && e.message) || e).slice(0, 200)); }
    },
  };
}

const LANG_NAMES = {
  en: 'English', hi: 'Hindi', ur: 'Urdu', bn: 'Bengali', ta: 'Tamil',
  te: 'Telugu', mr: 'Marathi', gu: 'Gujarati', pa: 'Punjabi', ar: 'Arabic',
  fr: 'French', es: 'Spanish', de: 'German', it: 'Italian', pt: 'Portuguese',
  ru: 'Russian', ja: 'Japanese', ko: 'Korean', 'zh-cn': 'Chinese', tr: 'Turkish',
  nl: 'Dutch', id: 'Indonesian', ms: 'Malay', th: 'Thai', vi: 'Vietnamese',
  fa: 'Persian', ne: 'Nepali', si: 'Sinhala', my: 'Burmese', uk: 'Ukrainian',
  pl: 'Polish', sv: 'Swedish', da: 'Danish', fi: 'Finnish', no: 'Norwegian',
  cs: 'Czech', hu: 'Hungarian', ro: 'Romanian', el: 'Greek', he: 'Hebrew',
  sw: 'Swahili', am: 'Amharic', ha: 'Hausa', yo: 'Yoruba', ig: 'Igbo',
  af: 'Afrikaans', tl: 'Tagalog', jv: 'Javanese', su: 'Sundanese', la: 'Latin',
};

const LANG_CODES = 'en hi ur bn ta te mr gu pa ar fr es de it pt ru ja ko zh-cn tr nl id ms th vi fa ne si my uk pl sv da fi no cs hu ro el he sw am ha yo ig af tl jv su la';

async function fetchRss(url) {
  const r = await axios.get(url, { timeout: 20000, headers: { 'User-Agent': 'QUEEN-AKUMA/2.7.0' }, validateStatus: (s) => s < 500 });
  if (r.status >= 400 || !r.data) return null;
  const xml = String(r.data);
  const items = [];
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  for (const b of blocks.slice(0, 5)) {
    const t = b.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
    const l = b.match(/<link>([\s\S]*?)<\/link>/);
    if (t && t[1]) items.push({ title: t[1].trim(), link: (l && l[1] ? l[1].trim() : '') });
  }
  return items.length ? items : null;
}

const GFX = [
  ['3D Render', '3D render logo'], ['Neon Glow', 'neon glow logo'],
  ['Golden', 'luxury golden metallic logo'], ['Cyberpunk', 'cyberpunk futuristic logo'],
  ['Watercolor', 'watercolor painting logo'], ['Pixel Art', 'pixel art logo'],
  ['Graffiti', 'graffiti street art logo'], ['Minimal', 'minimal flat vector logo'],
  ['Galaxy', 'galaxy cosmic space logo'], ['Vintage', 'vintage retro poster logo'],
  ['Anime', 'anime style logo'], ['Holographic', 'holographic chrome logo'],
];

module.exports = {
  commands: [
    // .v2sticker - video -> animated sticker (ffmpeg, sticker-alt.js pattern)
    {
      command: 'v2sticker', aliases: ['v2s'], category: 'advtools',
      description: 'Make an animated sticker from a video (reply to video)',
      usage: '.v2sticker (video pe reply)',
      async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
          const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
          if (!quotedMsg || !quotedMsg.videoMessage) {
            await sock.sendMessage(chatId, { text: '⚠️ Please reply to a video! Example: `.v2sticker` (video pe reply karke)' }, { quoted: message });
            return;
          }
          const stream = await downloadContentFromMessage(quotedMsg.videoMessage, 'video');
          let buffer = Buffer.from([]);
          for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
          const tempDir = path.join('./temp');
          if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
          const tempInput = path.join(tempDir, `v2s_${Date.now()}.mp4`);
          const tempOutput = path.join(tempDir, `v2s_${Date.now()}.webp`);
          fs.writeFileSync(tempInput, buffer);
          await new Promise((resolve, reject) => {
            const cmd = `"${ffmpegPath}" -i "${tempInput}" -vf "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease" -c:v libwebp -preset default -loop 0 -vsync 0 -t 6 "${tempOutput}"`;
            exec(cmd, (error) => { if (error) reject(error); else resolve(); });
          });
          await sock.sendMessage(chatId, { sticker: fs.readFileSync(tempOutput) }, { quoted: message });
          try { fs.unlinkSync(tempInput); fs.unlinkSync(tempOutput); } catch (_) {}
        } catch (error) {
          console.error('v2sticker error:', error.message);
          await sock.sendMessage(chatId, { text: '❌ *Failed to make animated sticker.* Try a short video (6 sec).' }, { quoted: message });
        }
      },
    },

    make('checkstore', ['storeinfo'], 'Show anti-delete store status', '.checkstore [optional]', async (sock, chatId, message, input, args, reply) => {
      return reply(`📦 *ANTI-DELETE STORE*\n\n${antidelete.statusText()}`);
    }),

    make('clearstore', [], 'Anti-delete store clear karo (owner)', '.clearstore [optional]', async (sock, chatId, message, input, args, reply) => {
      const n = antidelete.clearStore();
      return reply(`🧹 *Store cleared:* ${n} messages removed.`);
    }),

    make('sessioninfo', ['sessinfo'], 'Show bot session info', '.sessioninfo [optional]', async (sock, chatId, message, input, args, reply) => {
      const v = require('../package.json').version;
      const up = process.uptime();
      const h = Math.floor(up / 3600), m = Math.floor((up % 3600) / 60), s = Math.floor(up % 60);
      const num = ((sock.user && sock.user.id) || '').split(':')[0].split('@')[0];
      return reply(`🤖 *QUEEN AKUMA Session Info*\n\n• Bot Number: ${num || '—'}\n• Version: v${v}\n• Uptime: ${h}h ${m}m ${s}s\n• Platform: ${process.platform}\n• Node: ${process.version}`);
    }),

    make('langcodes', ['languages'], 'Translate ke language codes ki list', '.langcodes [optional]', async (sock, chatId, message, input, args, reply) => {
      const list = LANG_CODES.split(' ').map((c) => `${c} (${LANG_NAMES[c] || c})`).join(', ');
      return reply(`🌐 *Language Codes* (use with .translate / .ptranslate)\n\n${list}`);
    }),

    make('detectlang', ['detect', 'langdetect'], 'Detect the language of a text', '.detectlang <text>', async (sock, chatId, message, input, args, reply) => {
      const r = await axios.get('https://translate.googleapis.com/translate_a/single', {
        params: { client: 'gtx', sl: 'auto', tl: 'en', dt: 't', q: input }, timeout: 15000,
        validateStatus: (s) => s < 500,
      });
      if (r.status >= 400 || !r.data || !r.data[2]) return reply(FAIL);
      const code = r.data[2];
      const name = LANG_NAMES[code] || code;
      const translated = (r.data[0] && r.data[0][0] && r.data[0][0][0]) || '';
      return reply(`🌐 *Detected Language:* ${name} (${code})\n\n"${input.slice(0, 300)}"${translated ? `\n→ "${translated.slice(0, 300)}"` : ''}`);
    }),

    make('catfact', ['catfacts'], 'Random cat fact (no key)', '.catfact [optional]', async (sock, chatId, message, input, args, reply) => {
      const r = await axios.get('https://catfact.ninja/fact', { timeout: 15000, validateStatus: (s) => s < 500 });
      if (r.status >= 400 || !r.data || !r.data.fact) return reply(FAIL);
      return reply(`🐱 *Cat Fact*\n\n${r.data.fact}`);
    }),

    make('technews', ['tech'], 'Latest tech headlines (BBC + Google News RSS)', '.technews [optional]', async (sock, chatId, message, input, args, reply) => {
      let items = await fetchRss('https://feeds.bbci.co.uk/news/technology/rss.xml');
      if (!items) items = await fetchRss('https://news.google.com/rss/search?q=technology&hl=en-IN&gl=IN&ceid=IN:en');
      if (!items) return reply(FAIL);
      const lines = items.map((it, i) => `${i + 1}. ${it.title}${it.link ? `\n   ${it.link}` : ''}`).join('\n\n');
      return reply(`📰 *Tech News*\n\n${lines}`);
    }),

    ...GFX.map(([name, style], i) => make('gfx' + (i + 1), [], `GFX logo style ${i + 1}: ${name}`, `.gfx${i + 1} <text> [optional]`, async (sock, chatId, message, input) => {
      const text = (input || 'QUEEN AKUMA').slice(0, 60);
      await sock.sendMessage(chatId, { text: `🎨 Making ${name} logo…` }, { quoted: message }).catch(() => {});
      const buf = await pub.pollinationsImage(`${style} design of the text "${text}", centered, dark background, high quality, no watermark`);
      if (!buf) return sock.sendMessage(chatId, { text: FAIL }, { quoted: message });
      await sock.sendMessage(chatId, { image: buf, caption: `🎨 *${name} GFX*\n"${text}"` }, { quoted: message });
    })),

    // .app / .application - .apk ke aliases (apkCommand generic parse karta hai)
    {
      command: 'app', aliases: ['application'], category: 'advtools',
      description: 'Download an APK by app name', usage: '.app <app name>',
      async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        await apkCommand(sock, chatId, message);
      },
    },

    // .addsudo / .delsudo - sudo.js handler ke thin wrappers (owner check andar hai)
    {
      command: 'addsudo', aliases: [], category: 'advtools',
      description: 'Sudo user add karo (owner only)', usage: '.addsudo <@user|number>',
      async handler(sock, message, args, context = {}) {
        await sudoMod.handler(sock, message, ['add', ...(args || [])], context);
      },
    },
    {
      command: 'delsudo', aliases: [], category: 'advtools',
      description: 'Sudo user remove karo (owner only)', usage: '.delsudo <@user|number>',
      async handler(sock, message, args, context = {}) {
        await sudoMod.handler(sock, message, ['del', ...(args || [])], context);
      },
    },

    make('sudohelp', ['sudocmds'], 'Show sudo commands help', '.sudohelp [optional]', async (sock, chatId, message, input, args, reply) => {
      return reply(`📌 *Usage:* .sudo add|del|list @user`);
    }),
  ]
};
