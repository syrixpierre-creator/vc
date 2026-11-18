/**
 * QUEEN AKUMA v2.8.0 - QUEEN AKUMA port: group status posting (Baileys)
 * FEI ke lib/group-status.js ka CJS port. Audience name rebrand:
 * "Benfei Tech" -> "INCONNU BOY SENSEI". Baileys ke proto
 * StatusAudienceMetadata par depend karta hai - agar is Baileys
 * version me expose nahi hai to clear error dega (crash nahi).
 * View-once media kabhi repost nahi hota.
 */
const { randomBytes } = require('node:crypto');
const {
  downloadMediaMessage,
  generateWAMessageContent,
  generateWAMessageFromContent,
  proto
} = require('@whiskeysockets/baileys');

const GROUP_STATUS_COLORS = Object.freeze([
  { name: 'purple', hex: '#7C3AED', argb: 0xFF7C3AED },
  { name: 'blue', hex: '#2563EB', argb: 0xFF2563EB },
  { name: 'teal', hex: '#0F766E', argb: 0xFF0F766E },
  { name: 'green', hex: '#166534', argb: 0xFF166534 },
  { name: 'orange', hex: '#C2410C', argb: 0xFFC2410C },
  { name: 'pink', hex: '#BE185D', argb: 0xFFBE185D },
  { name: 'red', hex: '#B91C1C', argb: 0xFFB91C1C },
  { name: 'indigo', hex: '#4338CA', argb: 0xFF4338CA },
  { name: 'cyan', hex: '#0E7490', argb: 0xFF0E7490 },
  { name: 'emerald', hex: '#047857', argb: 0xFF047857 },
  { name: 'dark', hex: '#1F2937', argb: 0xFF1F2937 }
]);

const STATUS_AUDIENCE_NAME = 'INCONNU BOY SENSEI';
const STATUS_AUDIENCE_EMOJI = '⚡';
const lastStatusColorBySession = new Map();
const PATCH_MARKER = Symbol.for('queen-akuma.statusAudienceMetadataWireFields.v1');

function normalizeJid(value) {
  return String(value || '').trim().toLowerCase().replace(/^(\d+):\d+@/, '$1@');
}

function unwrapMessage(message) {
  let current = message;
  for (let depth = 0; current && depth < 8; depth += 1) {
    if (current.ephemeralMessage && current.ephemeralMessage.message) { current = current.ephemeralMessage.message; continue; }
    if (current.viewOnceMessage && current.viewOnceMessage.message) { current = current.viewOnceMessage.message; continue; }
    if (current.viewOnceMessageV2 && current.viewOnceMessageV2.message) { current = current.viewOnceMessageV2.message; continue; }
    if (current.documentWithCaptionMessage && current.documentWithCaptionMessage.message) { current = current.documentWithCaptionMessage.message; continue; }
    break;
  }
  return current || {};
}

function getContextInfo(message) {
  const body = unwrapMessage(message);
  if (!body || typeof body !== 'object') return null;
  for (const key of Object.keys(body)) {
    const part = body[key];
    if (part && typeof part === 'object' && part.contextInfo) return part.contextInfo;
  }
  return body.contextInfo || null;
}

function patchStatusAudienceEncoder() {
  const audienceType = proto && proto.ContextInfo && proto.ContextInfo.StatusAudienceMetadata;
  if (!audienceType || !audienceType.encode || !audienceType.fromObject) {
    throw new Error('Is Baileys version me StatusAudienceMetadata expose nahi hai.');
  }
  if (audienceType.encode[PATCH_MARKER]) return audienceType;
  const originalEncode = audienceType.encode;
  const encodeWithAudienceLabels = function (message, writer) {
    const output = originalEncode.call(this, message, writer);
    if (typeof message?.listName === 'string' && message.listName.length) {
      output.uint32(18).string(message.listName);
    }
    if (typeof message?.listEmoji === 'string' && message.listEmoji.length) {
      output.uint32(26).string(message.listEmoji);
    }
    return output;
  };
  Object.defineProperty(encodeWithAudienceLabels, PATCH_MARKER, { value: true });
  audienceType.encode = encodeWithAudienceLabels;
  return audienceType;
}

function attachCustomStatusAudience(message) {
  const StatusAudienceMetadata = patchStatusAudienceEncoder();
  const inner = (message && message.groupStatusMessageV2 && message.groupStatusMessageV2.message) || message;
  const contentKey = [
    'extendedTextMessage', 'imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage'
  ].find(key => inner && inner[key]);
  if (!contentKey) throw new Error('Group-status audience metadata attach nahi ho paya.');
  const content = inner[contentKey];
  content.contextInfo = content.contextInfo || {};
  const audience = content.contextInfo.statusAudienceMetadata ||
    StatusAudienceMetadata.fromObject({ audienceType: 1 });
  audience.audienceType = 1;
  audience.listName = STATUS_AUDIENCE_NAME;
  audience.listEmoji = STATUS_AUDIENCE_EMOJI;
  content.contextInfo.statusAudienceMetadata = audience;
  return message;
}

function statusContextInfo(kind) {
  const sourceType = kind === 'video' ? 1 : kind === 'audio' ? 3 : kind === 'text' ? 4 : 0;
  return {
    forwardingScore: 0,
    featureEligibilities: { canBeReshared: true, canReceiveMultiReact: true },
    pairedMediaType: 0,
    isGroupStatus: true,
    statusSourceType: sourceType,
    statusAttributions: [{ type: 10 }],
    statusAudienceMetadata: { audienceType: 1 }
  };
}

function buildGroupStatusRelayMessage(kind, innerMessage, messageSecret) {
  if (kind !== 'text') return innerMessage;
  innerMessage.messageContextInfo = Object.assign({}, innerMessage.messageContextInfo || {}, { messageSecret });
  return proto.Message.fromObject({
    messageContextInfo: { messageSecret },
    groupStatusMessageV2: { message: innerMessage }
  });
}

function parseGroupStatusColorOption(value) {
  const raw = String(value || '').trim();
  if (!/^--color(?:=|\s|$)/i.test(raw)) {
    return { text: raw, color: null, provided: false, error: '' };
  }
  const match = raw.match(/^--color(?:=|\s+)([^\s]+)(?:\s+([\s\S]*))?$/i);
  if (!match) return { text: '', color: null, provided: true, error: 'Usage: --color <name|#RRGGBB> <text>' };
  const token = match[1];
  const text = String(match[2] || '').trim();
  if (token.toLowerCase() === 'random') return { text, color: null, provided: true, error: '' };
  const normalized = token.toLowerCase();
  const named = GROUP_STATUS_COLORS.find(c => c.name === normalized);
  if (named) return { text, color: named, provided: true, error: '' };
  const hex = normalized.replace(/^#/, '');
  if (!/^[0-9a-f]{6}$/i.test(hex)) {
    return { text: '', color: null, provided: true, error: 'Unknown background color: ' + token };
  }
  const upperHex = '#' + hex.toUpperCase();
  const color = GROUP_STATUS_COLORS.find(item => item.hex === upperHex) || {
    name: 'custom',
    hex: upperHex,
    argb: 0xFF000000 + Number.parseInt(hex, 16)
  };
  return { text, color, provided: true, error: '' };
}

function pickStatusColor(sessionId, requestedColor) {
  const key = String(sessionId || 'default-session');
  if (requestedColor) {
    lastStatusColorBySession.set(key, requestedColor.hex);
    return requestedColor;
  }
  const previous = lastStatusColorBySession.get(key);
  const options = GROUP_STATUS_COLORS.filter(c => c.hex !== previous);
  const pool = options.length ? options : GROUP_STATUS_COLORS;
  const selected = pool[Math.floor(Math.random() * pool.length)];
  lastStatusColorBySession.set(key, selected.hex);
  if (lastStatusColorBySession.size > 500) {
    lastStatusColorBySession.delete(lastStatusColorBySession.keys().next().value);
  }
  return selected;
}

function getQuoted(ctx) {
  const info = getContextInfo(ctx.msg && ctx.msg.message);
  const message = (info && info.quotedMessage) || null;
  if (!info || !info.stanzaId || !message) return null;
  const participant = normalizeJid(info.participant || '');
  const selfJids = [ctx.sock && ctx.sock.user && ctx.sock.user.id, ctx.sock && ctx.sock.user && ctx.sock.user.lid].map(normalizeJid).filter(Boolean);
  const key = {
    remoteJid: ctx.jid,
    id: String(info.stanzaId),
    fromMe: Boolean(participant && selfJids.indexOf(participant) !== -1)
  };
  if (participant && String(ctx.jid || '').endsWith('@g.us')) key.participant = participant;
  return {
    message,
    wrapped: { key, message, messageTimestamp: ctx.msg && ctx.msg.messageTimestamp }
  };
}

function hasViewOnceWrapper(message) {
  let current = message;
  for (let depth = 0; current && depth < 8; depth += 1) {
    if (Object.keys(current).some(key => /viewOnceMessage/i.test(key))) return true;
    current = (current.ephemeralMessage && current.ephemeralMessage.message) ||
      (current.documentWithCaptionMessage && current.documentWithCaptionMessage.message);
  }
  return false;
}

function mediaKind(message) {
  if (hasViewOnceWrapper(message)) return '';
  const body = unwrapMessage(message);
  if (body.imageMessage) return 'image';
  if (body.videoMessage) return 'video';
  if (body.audioMessage) return 'audio';
  if (body.stickerMessage) return 'sticker';
  return '';
}

async function postGroupStatus(ctx, groupJid, kind, content, backgroundColor) {
  const target = String(groupJid || '');
  if (!target.endsWith('@g.us')) throw new Error('Valid WhatsApp group JID chahiye.');
  if (typeof ctx.sock.groupMetadata !== 'function') throw new Error('Is connection se group verify nahi ho sakta.');
  await ctx.sock.groupMetadata(target);
  const senderJid = normalizeJid((ctx.sock.user && (ctx.sock.user.id || ctx.sock.user.lid)) || '');
  if (!senderJid) throw new Error('Connected WhatsApp account ka JID nahi mila.');

  let innerMessage;
  if (kind === 'text') {
    const text = String((content && content.text) || '').trim();
    if (!text) throw new Error('Pehle text likho.');
    innerMessage = proto.Message.fromObject({
      extendedTextMessage: {
        text,
        font: 1,
        backgroundArgb: (backgroundColor && backgroundColor.argb) || 0xFF7C3AED,
        textArgb: 0xFFFFFFFF,
        contextInfo: statusContextInfo('text')
      }
    });
  } else {
    if (typeof ctx.sock.waUploadToServer !== 'function') {
      throw new Error('Is connection se group-status media upload nahi ho sakta.');
    }
    const prepared = await generateWAMessageContent(Object.assign({}, content, {
      contextInfo: statusContextInfo(kind)
    }), {
      upload: ctx.sock.waUploadToServer,
      logger: ctx.sock.logger,
      mediaCache: ctx.sock.mediaCache,
      options: {},
      jid: target
    });
    const mediaKey = kind + 'Message';
    if (!prepared || !prepared[mediaKey]) throw new Error('Baileys ne media prepare nahi kiya.');
    const media = prepared[mediaKey];
    if (!media.url || !media.mediaKey || !media.mimetype) {
      throw new Error('Baileys ne incomplete media metadata diya.');
    }
    if (kind === 'audio' && !media.backgroundArgb) media.backgroundArgb = 0xFF23313A;
    innerMessage = proto.Message.fromObject(prepared);
  }

  const messageSecret = randomBytes(32);
  const relayContent = buildGroupStatusRelayMessage(kind, innerMessage, messageSecret);
  const generated = generateWAMessageFromContent(target, relayContent, { userJid: senderJid });
  const mediaKey = kind + 'Message';
  if (kind === 'text') {
    if (!generated.message || !generated.message.groupStatusMessageV2 || !generated.message.groupStatusMessageV2.message || !generated.message.groupStatusMessageV2.message.extendedTextMessage) {
      throw new Error('Baileys ne group-status text envelope preserve nahi kiya.');
    }
  } else {
    const media = generated.message && generated.message[mediaKey];
    if (!media || !media.url || !media.mediaKey || !media.mimetype ||
        !media.contextInfo || !media.contextInfo.isGroupStatus ||
        media.contextInfo.statusSourceType === undefined) {
      throw new Error('Baileys ne group-status media fields preserve nahi kiye.');
    }
  }
  attachCustomStatusAudience(generated.message);
  if (typeof ctx.sock.relayMessage !== 'function') throw new Error('Is connection se group status relay nahi ho sakta.');
  const relayOptions = { messageId: generated.key.id, useCachedGroupMetadata: false };
  if (kind === 'text') {
    relayOptions.additionalNodes = [{ tag: 'meta', attrs: { is_group_status: 'true' } }];
  }
  await ctx.sock.relayMessage(target, generated.message, relayOptions);
  return { messageId: generated.key.id, groupJid: target };
}

async function postQuotedGroupStatus(ctx, groupJid, rawText, colorOption) {
  const quoted = getQuoted(ctx);
  const kind = quoted ? mediaKind(quoted.message) : '';
  if (quoted && hasViewOnceWrapper(quoted.message)) {
    throw new Error('View-once media repost nahi hota. Regular image/video/audio/sticker par reply karo.');
  }
  const text = String(rawText || '').trim();
  if (!kind && !text) throw new Error('Text likho ya image/video/audio/sticker par reply karo.');
  if (!kind && text.length > 1024) throw new Error('Text group status 1,024 characters tak.');
  if (kind && colorOption && colorOption.provided) throw new Error('Background color sirf text status par lagta hai.');
  const selectedColor = kind ? null : pickStatusColor(ctx.sessionId || (ctx.sock.user && ctx.sock.user.id), (colorOption && colorOption.color) || null);
  if (!kind) {
    return {
      result: await postGroupStatus(ctx, groupJid, 'text', { text }, selectedColor),
      kind: 'text',
      color: selectedColor
    };
  }
  const body = unwrapMessage(quoted.message);
  const buffer = await downloadMediaMessage(quoted.wrapped, 'buffer', {}, {
    reuploadRequest: ctx.sock.updateMediaMessage
  });
  if (!buffer || !buffer.length) throw new Error('Reply wala media download nahi ho paya.');
  const caption = (text || (body.imageMessage && body.imageMessage.caption) || (body.videoMessage && body.videoMessage.caption) || '').slice(0, 4000);
  const content = kind === 'audio'
    ? { audio: buffer, mimetype: (body.audioMessage && body.audioMessage.mimetype) || 'audio/ogg; codecs=opus', ptt: Boolean(body.audioMessage && body.audioMessage.ptt) }
    : kind === 'sticker'
      ? { sticker: buffer }
      : { [kind]: buffer, caption };
  return {
    result: await postGroupStatus(ctx, groupJid, kind, content),
    kind,
    color: null
  };
}

function listGroupStatusColors() {
  return GROUP_STATUS_COLORS.map(c => '• ' + c.name + ' — ' + c.hex).join('\n');
}

function parseGroupStatusColor(value) {
  return parseGroupStatusColorOption(value);
}

module.exports = {
  GROUP_STATUS_COLORS,
  listGroupStatusColors,
  parseGroupStatusColor,
  postGroupStatus,
  postQuotedGroupStatus
};
