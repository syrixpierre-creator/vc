'use strict';
/**
 * QUEEN AKUMA v3.5.0 — Store system (PATRON port).
 * Text/voice/image/sticker/video save karke naam se recall karo.
 * Per-chat store. Media data/store-media/ me file ke roop me.
 * Commands: .addmsg .getmsg .listmsg .delmsg
 * (command/store.js Plugin Store hai — usko touch nahi kiya.)
 */
const fs = require('fs');
const path = require('path');
const mediaDl = require('../lib/mediaDl');
const { getMedia, quotedMsg } = mediaDl;

const DATA_FILE = path.join(__dirname, '..', 'data', 'store.json');
const MEDIA_DIR = path.join(__dirname, '..', 'data', 'store-media');
function load() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch (e) { return {}; }
}
function save(d) {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2));
  } catch (e) {}
}
function safeChat(chatId) { return String(chatId).replace(/[^A-Za-z0-9]/g, '_'); }
function safeName(n) { return String(n || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 30); }
function extFor(kind, mime) {
  if (kind === 'image') return mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
  if (kind === 'video') return 'mp4';
  if (kind === 'audio') return 'mp3';
  if (kind === 'sticker') return 'webp';
  return 'bin';
}

module.exports = {
  commands: [
    {
      command: 'addmsg',
      aliases: ['savemsg', 'addstore'],
      description: 'Message save karo: reply karke .addmsg <naam>',
      category: 'tools',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const name = safeName((args || [])[0]);
        if (!name) { await reply('📌 *Usage:* reply to a message with .addmsg <name>'); return; }
        const store = load();
        const sc = safeChat(chatId);
        store[sc] = store[sc] || {};
        const media = await getMedia(message, ['image', 'video', 'audio', 'sticker']);
        const q = quotedMsg(message);
        const qText = q ? (q.conversation || (q.extendedTextMessage && q.extendedTextMessage.text) || (q.imageMessage && q.imageMessage.caption) || (q.videoMessage && q.videoMessage.caption) || '') : '';
        if (media) {
          const qm = q || {};
          const content = qm.imageMessage || qm.videoMessage || qm.audioMessage || qm.stickerMessage || {};
          const ext = extFor(media.kind, content.mimetype || '');
          const dir = path.join(MEDIA_DIR, sc);
          fs.mkdirSync(dir, { recursive: true });
          const file = path.join(dir, name + '.' + ext);
          fs.writeFileSync(file, media.buffer);
          store[sc][name] = { type: media.kind, file, mimetype: content.mimetype || '', caption: qText, by: context.senderId, at: Date.now() };
          save(store);
          await reply('✅ *Saved:* *' + name + '* (' + media.kind + ')');
        } else if (qText) {
          store[sc][name] = { type: 'text', text: qText, by: context.senderId, at: Date.now() };
          save(store);
          await reply('✅ *Saved:* *' + name + '* (text)');
        } else {
          await reply('📌 *Usage:* reply to a message with .addmsg <name>');
        }
      }
    },
    {
      command: 'getmsg',
      aliases: ['showmsg', 'recall'],
      description: 'Saved message wapas lao: .getmsg <naam>',
      category: 'tools',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const name = safeName((args || [])[0]);
        const store = load();
        const item = store[safeChat(chatId)] && store[safeChat(chatId)][name];
        if (!item) { await reply('❌ *' + (name || '') + '*: nothing saved with this name. See .listmsg'); return; }
        try {
          if (item.type === 'text') { await reply(item.text); return; }
          const buf = fs.readFileSync(item.file);
          if (item.type === 'image') await sock.sendMessage(chatId, { image: buf, caption: item.caption || '' }, { quoted: message });
          else if (item.type === 'video') await sock.sendMessage(chatId, { video: buf, caption: item.caption || '' }, { quoted: message });
          else if (item.type === 'audio') await sock.sendMessage(chatId, { audio: buf, mimetype: item.mimetype || 'audio/mpeg' }, { quoted: message });
          else if (item.type === 'sticker') await sock.sendMessage(chatId, { sticker: buf }, { quoted: message });
          else await reply('(unknown type: ' + item.type + ')');
        } catch (e) {
          await reply('❌ *Saved file not found.*');
        }
      }
    },
    {
      command: 'listmsg',
      aliases: ['liststore', 'stored'],
      description: 'Is chat ke saved messages ki list dikhao.',
      category: 'tools',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const store = load();
        const items = store[safeChat(chatId)] || {};
        const names = Object.keys(items);
        if (!names.length) { await reply('❌ *Nothing saved in this chat.*\n📌 *Usage:* reply to a message with .addmsg <name>'); return; }
        const lines = names.map((n, i) => (i + 1) + '. *' + n + '* (' + items[n].type + ')');
        await reply('💾 *Saved Messages* (' + names.length + ')\n\n' + lines.join('\n') + '\n\nGet it back: .getmsg <name>');
      }
    },
    {
      command: 'delmsg',
      aliases: ['delstore', 'removemsg'],
      description: 'Saved message hatao: .delmsg <naam>',
      category: 'tools',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const name = safeName((args || [])[0]);
        const store = load();
        const sc = safeChat(chatId);
        const item = store[sc] && store[sc][name];
        if (!item) { await reply('❌ *' + (name || '') + '*: nothing saved with this name.'); return; }
        const canDel = context.isSenderAdmin || context.senderIsOwnerOrSudo || context.isOwnerOrSudoCheck || item.by === context.senderId;
        if (!canDel) { await reply('🚫 *Only the one who saved it, an admin or the owner can delete it.*'); return; }
        try { if (item.file && fs.existsSync(item.file)) fs.unlinkSync(item.file); } catch (e) {}
        delete store[sc][name];
        save(store);
        await reply('✅ *Deleted:* *' + name + '*');
      }
    }
  ]
};
