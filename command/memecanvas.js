'use strict';
/**
 * QUEEN AKUMA v3.5.0 — Meme Canvas Pack (QUEEN AKUMA / some-random-api port).
 * Free names only — tweet/heart/circle/simpcard/tonikawa/lied/comrade/glass/jail
 * QUEEN AKUMA me pehle se hain, isliye yahan sirf naye wale.
 * API: api.some-random-api.com/canvas — free, no key.
 */
const axios = require('axios');
const mediaDl = require('../lib/mediaDl');
const { quotedSender, mentionedJids, avatarUrl } = mediaDl;

const API = 'https://api.some-random-api.com/canvas';

function reply(sock, message, text) {
  return sock.sendMessage(message.key.remoteJid, { text }, { quoted: message });
}
async function targetAvatar(sock, message) {
  const mentioned = mentionedJids(message);
  const target = (mentioned && mentioned[0]) || quotedSender(message) || message.key.participant || message.key.remoteJid;
  return avatarUrl(sock, target);
}
async function fetchImage(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 20000, maxContentLength: 20 * 1024 * 1024 });
  const ct = String((res.headers && res.headers['content-type']) || '');
  if (ct.indexOf('image') === -1 && ct.indexOf('octet') === -1) throw new Error('API se image nahi mili');
  return Buffer.from(res.data);
}
async function sendCanvas(sock, message, url) {
  const chatId = message.key.remoteJid;
  try {
    const img = await fetchImage(url);
    await sock.sendMessage(chatId, { image: img }, { quoted: message });
  } catch (e) {
    await reply(sock, message, '❌ Meme nahi ban paya: ' + String(e.message || e).slice(0, 120) + '\nAPI down ho sakti hai, thodi der baad try karo.');
  }
}

module.exports = {
  commands: [
    {
      command: 'triggered', aliases: ['trigger'],
      description: 'Triggered meme — avatar pe red "TRIGGERED" overlay.',
      category: 'fun',
      handler: async (sock, message, args, context) => {
        const av = await targetAvatar(sock, message);
        await sendCanvas(sock, message, API + '/overlay/triggered?avatar=' + encodeURIComponent(av));
      }
    },
    {
      command: 'passed', aliases: ['missionpassed'],
      description: 'Mission Passed (GTA style) meme avatar pe.',
      category: 'fun',
      handler: async (sock, message, args, context) => {
        const av = await targetAvatar(sock, message);
        await sendCanvas(sock, message, API + '/overlay/passed?avatar=' + encodeURIComponent(av));
      }
    },
    {
      command: 'namecard', aliases: ['idcard'],
      description: 'Name card banao: .namecard naam|birthday|description',
      category: 'fun',
      handler: async (sock, message, args, context) => {
        const joined = (args || []).join(' ');
        const parts = joined.split('|').map(s => (s || '').trim());
        const username = parts[0], birthday = parts[1], description = parts[2];
        if (!username || !birthday) {
          await reply(sock, message, '❌ Usage: *.namecard naam|birthday|description*\nExample: .namecard Inconnu|26/03/2007|tech guy');
          return;
        }
        const av = await targetAvatar(sock, message);
        const params = new URLSearchParams({ username, birthday, avatar: av });
        if (description) params.append('description', description);
        await sendCanvas(sock, message, API + '/misc/namecard?' + params.toString());
      }
    },
    {
      command: 'oogway', aliases: [],
      description: 'Master Oogway quote meme: .oogway <quote>',
      category: 'fun',
      handler: async (sock, message, args, context) => {
        const quote = (args || []).join(' ').trim();
        if (!quote) { await reply(sock, message, '❌ Usage: *.oogway <quote>*'); return; }
        const av = await targetAvatar(sock, message);
        await sendCanvas(sock, message, API + '/misc/oogway?quote=' + encodeURIComponent(quote) + '&avatar=' + encodeURIComponent(av));
      }
    },
    {
      command: 'oogway2', aliases: [],
      description: 'Master Oogway quote meme (style 2): .oogway2 <quote>',
      category: 'fun',
      handler: async (sock, message, args, context) => {
        const quote = (args || []).join(' ').trim();
        if (!quote) { await reply(sock, message, '❌ Usage: *.oogway2 <quote>*'); return; }
        const av = await targetAvatar(sock, message);
        await sendCanvas(sock, message, API + '/misc/oogway2?quote=' + encodeURIComponent(quote) + '&avatar=' + encodeURIComponent(av));
      }
    },
    {
      command: 'iss', aliases: ['its-so-stupid', 'itssostupid'],
      description: 'It\'s so stupid meme: .iss <text>',
      category: 'fun',
      handler: async (sock, message, args, context) => {
        const text = (args || []).join(' ').trim();
        if (!text) { await reply(sock, message, '❌ Usage: *.iss <text>*'); return; }
        const av = await targetAvatar(sock, message);
        await sendCanvas(sock, message, API + '/misc/its-so-stupid?dog=' + encodeURIComponent(text) + '&avatar=' + encodeURIComponent(av));
      }
    },
    {
      command: 'youtube-comment', aliases: ['ytcomment', 'ytc'],
      description: 'Fake YouTube comment: .youtube-comment naam|comment',
      category: 'fun',
      handler: async (sock, message, args, context) => {
        const joined = (args || []).join(' ');
        const parts = joined.split('|').map(s => (s || '').trim());
        const username = parts[0], comment = parts[1];
        if (!username || !comment) {
          await reply(sock, message, '❌ Usage: *.youtube-comment naam|comment*');
          return;
        }
        const av = await targetAvatar(sock, message);
        const params = new URLSearchParams({ username, comment, avatar: av });
        await sendCanvas(sock, message, API + '/misc/youtube-comment?' + params.toString());
      }
    },
    {
      command: 'face-palm', aliases: ['facepalm'],
      description: 'Facepalm anime GIF.',
      category: 'fun',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        let url = null;
        try {
          const r = await axios.get('https://api.waifu.pics/sfw/facepalm', { timeout: 12000 });
          url = r.data && r.data.url;
        } catch (e) {}
        if (!url) {
          try {
            const r2 = await axios.get('https://nekos.best/api/v2/facepalm', { timeout: 12000 });
            url = r2.data && r2.data.results && r2.data.results[0] && r2.data.results[0].url;
          } catch (e) {}
        }
        if (!url) {
          await reply(sock, message, '❌ GIF nahi mila, API down ho sakti hai. Thodi der baad try karo.');
          return;
        }
        try {
          await sock.sendMessage(chatId, { video: { url }, gifPlayback: true }, { quoted: message });
        } catch (e) {
          await sock.sendMessage(chatId, { image: { url }, caption: '🤦 Facepalm' }, { quoted: message });
        }
      }
    }
  ]
};
