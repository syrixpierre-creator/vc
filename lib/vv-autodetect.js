/*****************************************************************************
 * QUEEN AKUMA — Auto ViewOnce → owner DM (deep unwrap, image+video+audio)
 *****************************************************************************/
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const settings = require('../settings');
const { getAutoDetectMode } = require('./vv-settings');

const seen = new Set();
const SEEN_MAX = 800;

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

/** Recursively find view-once media in nested WA message tree */
function findViewOnceMedia(msg, depth = 0) {
  if (!msg || typeof msg !== 'object' || depth > 8) return null;

  // Standard wrappers
  const nestedKeys = [
    'viewOnceMessageV2',
    'viewOnceMessage',
    'viewOnceMessageV2Extension',
    'ephemeralMessage',
    'documentWithCaptionMessage',
    'templateMessage',
    'buttonsMessage',
    'listMessage',
    'viewOnceMessageV2Extension'
  ];

  for (const k of nestedKeys) {
    if (msg[k]?.message) {
      const found = findViewOnceMedia(msg[k].message, depth + 1);
      if (found) return found;
    }
  }

  // Direct media with viewOnce flag
  if (msg.imageMessage && (msg.imageMessage.viewOnce || depth > 0)) {
    return { type: 'image', node: msg.imageMessage, caption: msg.imageMessage.caption || '' };
  }
  if (msg.videoMessage && (msg.videoMessage.viewOnce || depth > 0)) {
    return { type: 'video', node: msg.videoMessage, caption: msg.videoMessage.caption || '' };
  }
  if (msg.audioMessage && (msg.audioMessage.viewOnce || depth > 0)) {
    return { type: 'audio', node: msg.audioMessage, caption: '' };
  }

  // Inside viewOnce wrapper the media itself may not set viewOnce flag
  if (depth > 0) {
    if (msg.imageMessage) return { type: 'image', node: msg.imageMessage, caption: msg.imageMessage.caption || '' };
    if (msg.videoMessage) return { type: 'video', node: msg.videoMessage, caption: msg.videoMessage.caption || '' };
    if (msg.audioMessage) return { type: 'audio', node: msg.audioMessage, caption: '' };
  }

  return null;
}

function ownerTargets(sock) {
  const targets = new Set();
  const num = String(settings.ownerNumber || '').replace(/\D/g, '');
  if (num) {
    targets.add(num + '@s.whatsapp.net');
    // LID-style sometimes needed — still try phone jid first
  }
  // also bot self (owner often is the bot number)
  try {
    const id = sock.user?.id || '';
    const bare = id.split(':')[0].split('@')[0];
    if (bare) targets.add(bare + '@s.whatsapp.net');
  } catch (_) {}
  return [...targets];
}

async function handleAutoDetectVv(sock, message) {
  try {
    if (!message?.message || message.key?.fromMe) return false;
    const chatId = message.key.remoteJid;
    if (!chatId || chatId === 'status@broadcast') return false;

    const mode = getAutoDetectMode(chatId);
    if (mode !== 'private' && mode !== 'on') return false;

    const found = findViewOnceMedia(message.message, 0);
    if (!found) return false;

    const mid = message.key.id || '';
    if (mid && seen.has(mid)) return false;
    if (mid) {
      seen.add(mid);
      if (seen.size > SEEN_MAX) {
        const first = seen.values().next().value;
        seen.delete(first);
      }
    }

    const { type: mediaType, node: mediaNode, caption } = found;
    const sender = message.key.participant || message.key.remoteJid;
    const senderName = String(sender || '').split('@')[0].split(':')[0];
    const isGroup = chatId.endsWith('@g.us');
    let groupName = '';
    if (isGroup) {
      try {
        const meta = await sock.groupMetadata(chatId);
        groupName = meta.subject || '';
      } catch (_) {}
    }

    const time = new Date().toLocaleString('en-IN', {
      timeZone: settings.timeZone || 'Asia/Kolkata',
      hour12: true,
      day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    // v3.6.1: download/forward fail ho to owner ko TEXT notice do — pehle ye
    // chup-chap fail hota tha (sirf console.error), user ko lagta tha detect
    // kaam hi nahi kar raha. Notice se pata chalta hai: detect chala, download fail hua.
    const notifyOwner = async (text) => {
      try {
        const t0 = ownerTargets(sock)[0];
        if (t0) await sock.sendMessage(t0, { text });
      } catch (_) {}
    };
    const where = isGroup ? ` • ${groupName || chatId.split('@')[0]}` : ' • DM';

    const dlType = mediaType === 'image' ? 'image' : mediaType === 'video' ? 'video' : 'audio';
    let buffer;
    try {
      const stream = await downloadContentFromMessage(mediaNode, dlType);
      buffer = await streamToBuffer(stream);
    } catch (e1) {
      // retry without type hint
      try {
        const stream = await downloadContentFromMessage(mediaNode, mediaType);
        buffer = await streamToBuffer(stream);
      } catch (e2) {
        console.error('[vv-autodetect] download failed:', e2.message);
        await notifyOwner(`⚠️ ViewOnce ${mediaType} aaya tha (${senderName}${where}) par download nahi ho paya — host se WhatsApp media download fail ho raha hai.`);
        return false;
      }
    }
    if (!buffer || !buffer.length) {
      console.error('[vv-autodetect] empty buffer');
      await notifyOwner(`⚠️ ViewOnce ${mediaType} aaya tha (${senderName}${where}) par khaali download aaya — forward nahi ho paya.`);
      return false;
    }

    const header =
      `🔓 *ViewOnce Recovered*\n\n` +
      `👤 From: ${senderName}\n` +
      (isGroup ? `👥 Group: *${groupName}*\n` : `💬 Chat: DM\n`) +
      `🕒 ${time}\n` +
      `📎 Type: *${mediaType}*\n` +
      (caption ? `📝 ${caption}\n` : '');

    const targets = ownerTargets(sock);
    let sent = false;
    for (const target of targets) {
      try {
        if (mediaType === 'image') {
          await sock.sendMessage(target, { image: buffer, caption: header });
        } else if (mediaType === 'video') {
          await sock.sendMessage(target, {
            video: buffer,
            caption: header,
            mimetype: mediaNode.mimetype || 'video/mp4'
          });
        } else {
          await sock.sendMessage(target, { text: header });
          await sock.sendMessage(target, {
            audio: buffer,
            mimetype: mediaNode.mimetype || 'audio/ogg; codecs=opus',
            ptt: !!mediaNode.ptt
          });
        }
        sent = true;
        console.log('[vv-autodetect] sent to', target, mediaType);
        break; // one success enough
      } catch (e) {
        console.error('[vv-autodetect] send fail', target, e.message);
      }
    }
    if (!sent) {
      await notifyOwner(`⚠️ ViewOnce ${mediaType} download ho gaya tha (${senderName}${where}) par owner DM me forward nahi ho paya.`);
    }
    return sent;
  } catch (err) {
    console.error('[vv-autodetect]', err.message);
    return false;
  }
}

module.exports = { handleAutoDetectVv, findViewOnceMedia };
