'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .getcase + .ambilq (TKM port). Owner-only.
 * .getcase <command> — us command ka source code dikhao.
 * .ambilq — quoted message ka raw JSON dikhao.
 */
const fs = require('fs');
const path = require('path');
const { loadEntry, CMD_DIR } = require('../lib/cmdLookup');

module.exports = {
  commands: [
    {
      command: 'getcase',
      aliases: ['getsource', 'cmdsource'],
      description: 'Kisi command ka source code dikhao (owner-only).',
      category: 'owner',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const isOwner = context.isOwnerOrSudoCheck || context.senderIsOwnerOrSudo;
        if (!isOwner) { await reply('🚫 *You are not authorized to use this command!*'); return; }
        const name = (args || [])[0];
        if (!name) { await reply('❌ Usage: *.getcase <command>*\nExample: .getcase ping'); return; }
        const loaded = loadEntry(name);
        if (!loaded || !loaded.found) {
          await reply('❌ *Command not found:* *' + name + '*');
          return;
        }
        if (loaded.error) {
          await reply('❌ *File not loaded* (' + loaded.found.file + '): ' + String(loaded.error).slice(0, 150));
          return;
        }
        const src = fs.readFileSync(path.join(CMD_DIR, loaded.found.file), 'utf8');
        const head = '📄 *' + loaded.found.name + '* — file: `' + loaded.found.file + '` (' + src.length + ' chars)\n\n';
        if (head.length + src.length <= 3500) {
          await reply(head + '```\n' + src + '\n```');
        } else {
          await sock.sendMessage(chatId, { document: Buffer.from(src, 'utf8'), mimetype: 'text/plain', fileName: loaded.found.file, caption: head }, { quoted: message });
        }
      }
    },
    {
      command: 'ambilq',
      aliases: ['rawmsg', 'getjson'],
      description: 'Quoted message ka raw JSON dikhao (owner-only).',
      category: 'owner',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const isOwner = context.isOwnerOrSudoCheck || context.senderIsOwnerOrSudo;
        if (!isOwner) { await reply('🚫 *You are not authorized to use this command!*'); return; }
        const qm = message.message && message.message.extendedTextMessage && message.message.extendedTextMessage.contextInfo && message.message.extendedTextMessage.contextInfo.quotedMessage;
        if (!qm) {
          await reply('📌 *Usage:* reply to a message with .ambilq');
          return;
        }
        const json = JSON.stringify(qm, null, 2);
        if (json.length <= 3500) {
          await reply('```\n' + json + '\n```');
        } else {
          await sock.sendMessage(chatId, { document: Buffer.from(json, 'utf8'), mimetype: 'application/json', fileName: 'quoted-message.json' }, { quoted: message });
        }
      }
    }
  ]
};
