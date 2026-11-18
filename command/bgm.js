'use strict';
/**
 * QUEEN AKUMA v3.5.0 — BGM system (QUEEN AKUMA + queen-akuma port).
 * .bgm on/off — keyword par auto audio clip (7 triggers, GitHub raw MP3, no key).
 * .videomusic — quoted video me BGM mix karo (--vol 0-100, --replace).
 * State: data/bgm.json (per-chat enabled).
 */
const fs = require('fs');
const path = require('path');
const mediaDl = require('../lib/mediaDl');
const { getMediaPair, writeTmp, cleanup, ffmpeg } = mediaDl;

const BGM_LIST = {
  begins: 'https://github.com/SamPandey001/Secktor-Plugins/raw/main/plugins/bgm/And%20so%20it%20begins.mp3',
  sparrow: 'https://github.com/SamPandey001/Secktor-Plugins/raw/main/plugins/bgm/Jack%20Sparrow%20Images%20!%20Jack%20Sparrow%20!%20Theme.mp3',
  sorry: 'https://github.com/SamPandey001/Secktor-Plugins/raw/main/plugins/bgm/Baby%20Im%20So%20Sorry.mp3',
  piano: 'https://github.com/SamPandey001/Secktor-Plugins/raw/main/plugins/bgm/Bachelor%20Movie%20Piano%20Bgm%20-%20Adiye%20Bgm.mp3',
  'first class': 'https://github.com/SamPandey001/Secktor-Plugins/raw/main/plugins/bgm/First%20Class%20-%20Arjit%20Singh%20!%20Romantic%20!%20Hindi.mp3',
  'got you': 'https://github.com/SamPandey001/Secktor-Plugins/raw/main/plugins/bgm/I%20Got%20You%20-%20Levitating%20-%20Dua%20Lipa%20!%20English%20Song.mp3',
  sad: 'https://github.com/SamPandey001/Secktor-Plugins/raw/main/plugins/bgm/alan-faded.mp3'
};
const DATA_FILE = path.join(__dirname, '..', 'data', 'bgm.json');
function loadState() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch (e) { return {}; }
}
function saveState(st) {
  try { fs.writeFileSync(DATA_FILE, JSON.stringify(st, null, 2)); } catch (e) {}
}
function msgText(message) {
  const m = message && message.message;
  if (!m) return '';
  return m.conversation || (m.extendedTextMessage && m.extendedTextMessage.text) ||
    (m.imageMessage && m.imageMessage.caption) || (m.videoMessage && m.videoMessage.caption) || '';
}

module.exports = {
  commands: [
    {
      command: 'bgm',
      aliases: ['backgroundmusic'],
      description: 'Keyword BGM on/off karo: .bgm on | off | list (group admin).',
      category: 'media',
      groupOnly: true,
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const canManage = context.isSenderAdmin || context.senderIsOwnerOrSudo || context.isOwnerOrSudoCheck;
        if (!canManage) { await reply('❌ *Only group admins or the bot owner can use this command.*'); return; }
        const sub = String((args && args[0]) || '').toLowerCase();
        const st = loadState();
        if (sub === 'on' || sub === 'enable') {
          st[chatId] = true; saveState(st);
          await reply('✅ BGM ON ho gaya. Triggers: ' + Object.keys(BGM_LIST).join(', '));
        } else if (sub === 'off' || sub === 'disable') {
          delete st[chatId]; saveState(st);
          await reply('✅ BGM OFF ho gaya.');
        } else {
          const on = !!st[chatId];
          await reply('🎵 *BGM Settings*\nStatus: *' + (on ? 'ON' : 'OFF') + '*\n\n*.bgm on* / *.bgm off* se toggle karo.\n\nTriggers: ' + Object.keys(BGM_LIST).join(', '));
        }
      }
    },
    {
      command: 'videomusic',
      aliases: ['vbgm', 'addbgm', 'bgmmix'],
      description: 'Video me BGM mix karo: video pe reply + audio pe reply, .videomusic [--vol 30] [--replace]',
      category: 'media',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        let vol = 30, replace = false;
        const a = args || [];
        for (let i = 0; i < a.length; i++) {
          if (a[i] === '--vol' && a[i + 1]) { const v = parseInt(a[i + 1], 10); if (!isNaN(v) && v >= 0 && v <= 100) vol = v; }
          if (a[i] === '--replace') replace = true;
        }
        const pair = await getMediaPair(message);
        const own = pair.own, quoted = pair.quoted;
        let videoBuf = null, audioBuf = null;
        if (own && quoted) {
          if (own.kind === 'video' && quoted.kind === 'audio') { videoBuf = own.buffer; audioBuf = quoted.buffer; }
          else if (own.kind === 'audio' && quoted.kind === 'video') { audioBuf = own.buffer; videoBuf = quoted.buffer; }
        }
        if (!videoBuf || !audioBuf) {
          await reply('❌ Usage: video bhejte waqt audio pe reply karo (ya audio bhejte waqt video pe reply karo) aur *.videomusic* likho.\nOptions: --vol 0-100 (default 30), --replace (original audio hata ke sirf BGM).');
          return;
        }
        const vIn = writeTmp(videoBuf, 'mp4');
        const aIn = writeTmp(audioBuf, 'mp3');
        const outPath = vIn + '.bgm.mp4';
        await reply(sock, message, '⏳ BGM mix ho raha hai...');
        const mixArgs = ['-y', '-i', vIn, '-i', aIn, '-filter_complex',
          '[1:a]volume=' + (vol / 100) + '[a1];[0:a][a1]amix=inputs=2:duration=first:dropout_transition=0[aout]',
          '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-shortest', outPath];
        const replaceArgs = ['-y', '-i', vIn, '-i', aIn, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-shortest', outPath];
        try {
          if (replace) {
            await ffmpeg(replaceArgs, 120000);
          } else {
            try { await ffmpeg(mixArgs, 120000); }
            catch (e) { await ffmpeg(replaceArgs, 120000); } // video me audio track nahi — replace karo
          }
          await sock.sendMessage(chatId, { video: fs.readFileSync(outPath), caption: '🎵 BGM mix ready' }, { quoted: message });
        } catch (e) {
          await reply('❌ BGM mix nahi ho paya: ' + String(e.message || e).slice(0, 150));
        } finally { cleanup(vIn, aIn, outPath); }
      }
    }
  ],
  // Keyword trigger hook
  async onMessage(sock, message, context = {}) {
    try {
      const chatId = message.key.remoteJid;
      if (!chatId || !chatId.endsWith('@g.us')) return;
      const st = loadState();
      if (!st[chatId]) return;
      const text = msgText(message).toLowerCase();
      if (!text || text.trim().startsWith('.')) return;
      for (const key of Object.keys(BGM_LIST)) {
        const esc = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (new RegExp('\\b' + esc + '\\b').test(text)) {
          try {
            await sock.sendMessage(chatId, { audio: { url: BGM_LIST[key] }, mimetype: 'audio/mpeg' }, { quoted: message });
          } catch (e) {}
          return;
        }
      }
    } catch (e) {}
  }
};
