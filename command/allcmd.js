'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .allcmd (YESSER port).
 * Sticker se judi commands ki list dikhao. command/ dir ko text-scan karta
 * hai (lib/cmdLookup) — koi file load nahi karta.
 * 'all' smartRun wrapper bhi rakha gaya hai (pehle isi file me tha).
 */
const fs = require('fs');
const path = require('path');
const { CMD_DIR } = require('../lib/cmdLookup');

module.exports = {
  commands: [
    {
      command: 'allcmd',
      aliases: ['stickercmds'],
      description: 'Sticker wali commands ki list dikhao.',
      category: 'tools',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        let files = [];
        try { files = fs.readdirSync(CMD_DIR).filter((f) => f.endsWith('.js')); } catch (e) {}
        const found = [];
        for (const f of files) {
          let src = '';
          try { src = fs.readFileSync(path.join(CMD_DIR, f), 'utf8'); } catch (e) { continue; }
          if (!/sticker/i.test(src)) continue;
          const names = [...src.matchAll(/command\s*:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
          if (names.length) found.push({ file: f, names });
        }
        if (!found.length) {
          await reply('❌ *No sticker command found.*');
          return;
        }
        const lines = ['🎨 *Sticker Commands* (' + found.reduce((n, g) => n + g.names.length, 0) + ')\n'];
        for (const g of found.slice(0, 40)) {
          lines.push('• ' + g.names.map((n) => '.' + n).join(', ') + '  —  `' + g.file + '`');
        }
        const text = lines.join('\n');
        if (text.length > 3500) {
          await sock.sendMessage(chatId, { document: Buffer.from(text, 'utf8'), mimetype: 'text/plain', fileName: 'sticker-commands.txt' }, { quoted: message });
        } else {
          await reply(text);
        }
      }
    },
    {
      command: 'all',
      aliases: ['allcmds'],
      category: 'main',
      description: 'Smart Engine: all',
      usage: '.all <input>',
      handler: async (sock, message, args, context) => {
        const chatId = context.chatId || message.key.remoteJid;
        const text = (args || []).join(' ').trim();
        try {
          const { smartRun, sendResult } = require('../lib/smartEngine');
          const result = await smartRun('all', text, { category: 'main' });
          await sendResult(sock, chatId, message, result);
        } catch (e) {
          await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
        }
      }
    }
  ]
};
