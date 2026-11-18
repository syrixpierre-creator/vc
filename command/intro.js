/*****************************************************************************
 * QUEEN AKUMA — Personal Intro
 * .intro set <text>     — set your intro (reply photo for image+text)
 * .intro del            — delete your intro
 * .intro                — show your intro
 * Anyone types "intro" (or .intro with no set) in group/DM → bot sends
 * that user's saved intro (if set).
 *****************************************************************************/
const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const DATA = path.join(__dirname, '../data/intros.json');
const MEDIA_DIR = path.join(__dirname, '../data/intro_media');

if (!fs.existsSync(path.dirname(DATA))) fs.mkdirSync(path.dirname(DATA), { recursive: true });
if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });

function loadAll() {
  try {
    if (fs.existsSync(DATA)) return JSON.parse(fs.readFileSync(DATA, 'utf8'));
  } catch {}
  return {};
}
function saveAll(obj) {
  fs.writeFileSync(DATA, JSON.stringify(obj, null, 2));
}

function uid(jid) {
  return String(jid || '').split(':')[0].split('@')[0];
}

async function toBuffer(stream) {
  let b = Buffer.from([]);
  for await (const c of stream) b = Buffer.concat([b, c]);
  return b;
}

async function extractImage(message) {
  const msg = message.message || {};
  if (msg.imageMessage) {
    const stream = await downloadContentFromMessage(msg.imageMessage, 'image');
    return { buffer: await toBuffer(stream), caption: msg.imageMessage.caption || '' };
  }
  const q = msg.extendedTextMessage?.contextInfo?.quotedMessage;
  if (q?.imageMessage) {
    const stream = await downloadContentFromMessage(q.imageMessage, 'image');
    return { buffer: await toBuffer(stream), caption: q.imageMessage.caption || '' };
  }
  return null;
}

async function sendIntro(sock, chatId, intro, quoted) {
  const text = intro.text || '';
  const imgPath = intro.imagePath && fs.existsSync(intro.imagePath) ? intro.imagePath : null;
  if (imgPath) {
    await sock.sendMessage(chatId, {
      image: { url: imgPath },
      caption: text || '👋 Intro'
    }, quoted ? { quoted } : undefined);
  } else if (text) {
    await sock.sendMessage(chatId, { text }, quoted ? { quoted } : undefined);
  }
}

module.exports = {
  command: 'intro',
  aliases: ['myintro', 'setintro'],
  category: 'general',
  description: 'Set / show personal intro (text + optional photo). Auto-send when someone types intro',
  usage: '.intro set <text> | .intro del | .intro',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const sender = context.sender || message.key.participant || message.key.remoteJid;
    const id = uid(sender);
    const all = loadAll();
    const sub = (args[0] || '').toLowerCase();

    // .intro set ...
    if (sub === 'set') {
      let text = args.slice(1).join(' ').trim();
      const img = await extractImage(message);
      if (img && !text) text = img.caption || '';
      if (!text && !img) {
        return sock.sendMessage(chatId, {
          text: 'Usage:\n`.intro set Hello I am ...`\nOr reply to a *photo* + `.intro set My name is ...`'
        }, { quoted: message });
      }

      const entry = { text: text || '', imagePath: null, updated: Date.now() };
      if (img) {
        const p = path.join(MEDIA_DIR, `${id}.jpg`);
        fs.writeFileSync(p, img.buffer);
        entry.imagePath = p;
      } else if (all[id]?.imagePath) {
        // keep old image if only text updated without new photo
        entry.imagePath = all[id].imagePath;
      }

      all[id] = entry;
      saveAll(all);
      await sock.sendMessage(chatId, { text: '✅ *Intro saved!*\n\nType `intro` in group or DM to show it.' }, { quoted: message });
      // preview
      await sendIntro(sock, chatId, entry, message);
      return;
    }

    // .intro del
    if (sub === 'del' || sub === 'delete' || sub === 'remove') {
      if (all[id]?.imagePath) {
        try { fs.unlinkSync(all[id].imagePath); } catch {}
      }
      delete all[id];
      saveAll(all);
      return sock.sendMessage(chatId, { text: '🗑️ Your intro was deleted.' }, { quoted: message });
    }

    // .intro  → show own, or if someone has intro and typed just intro via alias path
    if (all[id]) {
      await sendIntro(sock, chatId, all[id], message);
      return;
    }
    return sock.sendMessage(chatId, {
      text:
`*👋 INTRO*\n\n` +
`You have no intro set.\n\n` +
`• \`.intro set <text>\` — save text\n` +
`• Reply photo + \`.intro set <text>\` — photo + text\n` +
`• \`.intro del\` — remove\n` +
`• \`.intro\` — show your intro\n\n` +
`Anyone can type *intro* in group/DM and bot will send *their* saved intro.`
    }, { quoted: message });
  },

  /**
   * Auto-trigger: plain message "intro" (no prefix) or only "intro"
   * Called from messageHandler
   */
  async handleAutoIntro(sock, message) {
    try {
      const msg = message.message || {};
      const text = (
        msg.conversation ||
        msg.extendedTextMessage?.text ||
        ''
      ).trim().toLowerCase();

      // only exact "intro" (not .intro — that goes to command handler)
      if (text !== 'intro' && text !== 'my intro') return false;

      const chatId = message.key.remoteJid;
      const sender = message.key.participant || message.key.remoteJid;
      const id = uid(sender);
      const all = loadAll();
      if (!all[id]) {
        await sock.sendMessage(chatId, {
          text: `❌ @${id} has no intro set.\nUse \`.intro set <text>\` (photo optional).`,
          mentions: [sender]
        }, { quoted: message });
        return true;
      }
      await sendIntro(sock, chatId, all[id], message);
      return true;
    } catch (e) {
      console.error('[intro] auto:', e.message);
      return false;
    }
  }
};
