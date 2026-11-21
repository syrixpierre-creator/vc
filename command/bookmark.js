'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .bookmark / .saved (queen-akuma port).
 * Messages save karo, baad me wapas lo. Per-user store (DM/group dono).
 * 'save' naam status-saver.js ka hai, isliye .bookmark use karte hain.
 */
const fs = require('fs');
const path = require('path');
const mediaDl = require('../lib/mediaDl');
const { getMedia, quotedMsg } = mediaDl;

const DATA_FILE = path.join(__dirname, '..', 'data', 'bookmarks.json');
const MEDIA_DIR = path.join(__dirname, '..', 'data', 'bookmarks-media');
function load() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch (e) { return {}; }
}
function save(d) {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2));
  } catch (e) {}
}
function key(jid) { return String(jid || '').replace(/:\d+@/, '@').split('@')[0]; }

module.exports = {
  commands: [
    {
      command: 'bookmark',
      aliases: ['bm', 'savemessage'],
      description: 'Message bookmark karo (reply karke).',
      category: 'tools',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const sender = message.key.participant || context.senderId;
        const k = key(sender);
        const media = await getMedia(message, ['image', 'video', 'audio', 'sticker']);
        const q = quotedMsg(message);
        const qText = q ? (q.conversation || (q.extendedTextMessage && q.extendedTextMessage.text) || (q.imageMessage && q.imageMessage.caption) || (q.videoMessage && q.videoMessage.caption) || '') : '';
        if (!media && !qText) {
          await reply('📌 *Usage:* reply to a message with .bookmark');
          return;
        }
        const store = load();
        store[k] = store[k] || [];
        const id = 'bm' + (store[k].length + 1) + '-' + Date.now().toString(36);
        const item = { id, chatId, at: Date.now(), text: qText || '' };
        if (media) {
          const qm = q || {};
          const content = qm.imageMessage || qm.videoMessage || qm.audioMessage || qm.stickerMessage || {};
          const ext = media.kind === 'image' ? 'jpg' : media.kind === 'video' ? 'mp4' : media.kind === 'audio' ? 'mp3' : 'webp';
          const dir = path.join(MEDIA_DIR, k);
          fs.mkdirSync(dir, { recursive: true });
          const file = path.join(dir, id + '.' + ext);
          fs.writeFileSync(file, media.buffer);
          item.type = media.kind; item.file = file; item.mimetype = content.mimetype || '';
        } else {
          item.type = 'text';
        }
        store[k].push(item);
        save(store);
        await reply('✅ *Bookmark saved!* ID: *' + id + '*\nView: .saved or .getbookmark ' + id + '*');
      }
    },
    {
      command: 'saved',
      aliases: ['bookmarks', 'mybookmarks'],
      description: 'Apne bookmarks ki list dikhao.',
      category: 'tools',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const sender = message.key.participant || context.senderId;
        const items = (load()[key(sender)] || []);
        if (!items.length) {
          await reply('❌ *You have no bookmarks.*');
          return;
        }
        const lines = items.slice(-20).map((it, i) =>
          (i + 1) + '. *' + it.id + '* (' + it.type + ') — ' + (it.text ? it.text.slice(0, 60) : 'media') + '  [' + new Date(it.at).toLocaleDateString('en-IN') + ']');
        await reply('🔖 *Tumhare Bookmarks* (' + items.length + ')\n\n' + lines.join('\n') + '\n\nKholo: *.getbookmark <id>*  •  Hatao: *.delbookmark <id>*');
      }
    },
    {
      command: 'getbookmark',
      aliases: ['openbookmark', 'showbm'],
      description: 'Bookmark kholo: .getbookmark <id>',
      category: 'tools',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const id = (args || [])[0];
        const sender = message.key.participant || context.senderId;
        const items = (load()[key(sender)] || []);
        const item = items.find((it) => it.id === id);
        if (!item) { await reply('❌ *Bookmark not found:* *' + (id || '') + '*'); return; }
        try {
          if (item.type === 'text') { await reply('🔖 *' + item.id + '*\n\n' + item.text); return; }
          const buf = fs.readFileSync(item.file);
          if (item.type === 'image') await sock.sendMessage(chatId, { image: buf, caption: item.text || '' }, { quoted: message });
          else if (item.type === 'video') await sock.sendMessage(chatId, { video: buf, caption: item.text || '' }, { quoted: message });
          else if (item.type === 'audio') await sock.sendMessage(chatId, { audio: buf, mimetype: item.mimetype || 'audio/mpeg' }, { quoted: message });
          else if (item.type === 'sticker') await sock.sendMessage(chatId, { sticker: buf }, { quoted: message });
        } catch (e) {
          await reply('❌ *Bookmark file not found.*');
        }
      }
    },
    {
      command: 'delbookmark',
      aliases: ['delbm', 'removebookmark'],
      description: 'Bookmark hatao: .delbookmark <id>',
      category: 'tools',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const id = (args || [])[0];
        const sender = message.key.participant || context.senderId;
        const k = key(sender);
        const store = load();
        const items = store[k] || [];
        const idx = items.findIndex((it) => it.id === id);
        if (idx === -1) { await reply('❌ *Bookmark not found:* *' + (id || '') + '*'); return; }
        const [gone] = items.splice(idx, 1);
        try { if (gone.file && fs.existsSync(gone.file)) fs.unlinkSync(gone.file); } catch (e) {}
        save(store);
        await reply('✅ *Bookmark deleted:* *' + id + '*');
      }
    }
  ]
};
