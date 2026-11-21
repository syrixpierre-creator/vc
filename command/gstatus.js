/*****************************************************************************
 * QUEEN AKUMA — .gstatus
 * ONLY current group ke members ko group-status (status ring)
 * Personal status / dusre contacts pe nahi
 *
 * Method: status@broadcast + statusJidList = is group ke participants only
 * + isGroupStatus: true + groupJid link
 *****************************************************************************/
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const settings = require('../settings');

const STATUS_JID = 'status@broadcast';

const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/:\d+(?=@|$)/, '')
    .replace(/@(lid|s\.whatsapp\.net|c\.us|g\.us)$/, '')
    .replace(/\D/g, '');

async function downloadMedia(message, type) {
  const stream = await downloadContentFromMessage(message, type);
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function quotedMessage(m) {
  return (
    m.quoted?.message ||
    m.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
    m.message?.imageMessage?.contextInfo?.quotedMessage ||
    m.message?.videoMessage?.contextInfo?.quotedMessage ||
    null
  );
}

function quotedText(message) {
  return (
    message?.conversation ||
    message?.extendedTextMessage?.text ||
    message?.imageMessage?.caption ||
    message?.videoMessage?.caption ||
    message?.documentMessage?.caption ||
    ''
  );
}

async function isAllowed(sock, m, from) {
  const sender = m.key.participant || m.participant || m.key.remoteJid;
  if (m.key.fromMe || normalize(sender) === normalize(settings.ownerNumber)) return true;
  if (!from.endsWith('@g.us') || typeof sock.groupMetadata !== 'function') return false;
  try {
    const metadata = await sock.groupMetadata(from);
    return (metadata?.participants || []).some(
      (p) =>
        (p.admin === 'admin' || p.admin === 'superadmin') &&
        [p.id, p.lid, p.jid, p.phoneNumber].some((id) => normalize(id) === normalize(sender))
    );
  } catch (_) {
    return false;
  }
}

/** Build audience ONLY from this group — unique phone/lid jids */
function buildAudience(metadata) {
  const out = [];
  const seen = new Set();
  for (const p of metadata?.participants || []) {
    for (const id of [p.id, p.lid, p.jid, p.phoneNumber]) {
      if (!id || typeof id !== 'string') continue;
      // keep proper jids only
      if (!id.includes('@')) continue;
      if (id.endsWith('@g.us') || id.endsWith('@broadcast')) continue;
      const key = id.split(':')[0];
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(id.includes(':') ? id.split(':')[0] + (id.includes('@lid') ? '@lid' : '@s.whatsapp.net') : id);
    }
  }
  return out;
}

async function gstatusHandler(sock, m, args = []) {
  const from = m.key.remoteJid;
  const reply = (text) => sock.sendMessage(from, { text: String(text) }, { quoted: m });

  // MUST be inside a group — usi group ka status
  if (!from.endsWith('@g.us')) {
    return reply('❌ *This command only works in groups.*');
  }

  if (!(await isAllowed(sock, m, from))) {
    return reply('🚫 *Only group admins can post to group status.*');
  }

  const quoted = quotedMessage(m);
  const text = args.join(' ').trim() || quotedText(quoted);

  let content;
  try {
    if (quoted?.imageMessage) {
      content = {
        image: await downloadMedia(quoted.imageMessage, 'image'),
        caption: text || undefined
      };
    } else if (quoted?.videoMessage) {
      content = {
        video: await downloadMedia(quoted.videoMessage, 'video'),
        caption: text || undefined,
        mimetype: quoted.videoMessage.mimetype || 'video/mp4'
      };
    } else if (quoted?.audioMessage) {
      content = {
        audio: await downloadMedia(quoted.audioMessage, 'audio'),
        mimetype: quoted.audioMessage.mimetype || 'audio/mp4',
        ptt: false
      };
    } else if (quoted?.documentMessage) {
      content = {
        document: await downloadMedia(quoted.documentMessage, 'document'),
        mimetype: quoted.documentMessage.mimetype,
        fileName: quoted.documentMessage.fileName || 'status-document'
      };
    } else if (text) {
      content = { text };
    } else {
      return reply('📌 *Usage:* .gstatus <text> or reply to an image/video/audio');
    }

    const metadata = await sock.groupMetadata(from);
    const groupName = metadata?.subject || 'Group';
    const audience = buildAudience(metadata);

    if (!audience.length) {
      return reply('❌ *No group members found.*');
    }

    // Mark as GROUP status linked to THIS group only
    content.contextInfo = {
      ...(content.contextInfo || {}),
      isGroupStatus: true,
      // help clients bind status to this group
      forwardingScore: 0,
      isForwarded: false,
      externalAdReply: undefined
    };

    // Primary: status broadcast with ONLY this group's members
    await sock.sendMessage(STATUS_JID, content, {
      statusJidList: audience,
      // some WA builds honor backgroundColor etc — optional
    });

    return reply('✅ *Group status posted*');
  } catch (error) {
    console.error('[GSTATUS ERROR]', error);
    return reply(`❌ *Failed to post group status*\nError: ${error.message}`);
  }
}

module.exports = {
  command: 'gstatus',
  aliases: ['gs', 'gpstatus', 'groupstatus', 'gstatut', 'poststatus'],
  category: 'group',
  description: 'Post status for THIS group members only (not personal story)',
  usage: '.gstatus (reply media in group)',
  groupOnly: true,
  async handler(sock, message, args) {
    return gstatusHandler(sock, message, args);
  }
};
