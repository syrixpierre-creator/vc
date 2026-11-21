/*****************************************************************************
 * QUEEN AKUMA — Channel Status (24h Story on Channel)
 *****************************************************************************/
const {
  downloadContentFromMessage,
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  generateMessageID
} = require("@whiskeysockets/baileys");
const settings = require("../settings");

async function toBuffer(stream) {
  let b = Buffer.from([]);
  for await (const c of stream) b = Buffer.concat([b, c]);
  return b;
}

async function getMedia(message) {
  const msg = message.message || {};
  if (msg.imageMessage) {
    return {
      type: "image",
      buffer: await toBuffer(await downloadContentFromMessage(msg.imageMessage, "image")),
      caption: msg.imageMessage.caption || ""
    };
  }
  if (msg.videoMessage) {
    return {
      type: "video",
      buffer: await toBuffer(await downloadContentFromMessage(msg.videoMessage, "video")),
      caption: msg.videoMessage.caption || ""
    };
  }
  const q = msg.extendedTextMessage && msg.extendedTextMessage.contextInfo
    ? msg.extendedTextMessage.contextInfo.quotedMessage
    : null;
  if (q && q.imageMessage) {
    return {
      type: "image",
      buffer: await toBuffer(await downloadContentFromMessage(q.imageMessage, "image")),
      caption: q.imageMessage.caption || ""
    };
  }
  if (q && q.videoMessage) {
    return {
      type: "video",
      buffer: await toBuffer(await downloadContentFromMessage(q.videoMessage, "video")),
      caption: q.videoMessage.caption || ""
    };
  }
  return null;
}

function resolveChannelJid(args, settings) {
  const maybe = (args[0] || "").trim();
  if (maybe.includes("@newsletter")) {
    return { jid: maybe, restArgs: args.slice(1) };
  }
  return { jid: settings.channelId || settings.newsletterId || "", restArgs: args };
}

async function tryCapabilities(sock, channelJid) {
  try {
    if (typeof sock.newsletterAdminCapabilities === "function") {
      return await sock.newsletterAdminCapabilities(channelJid);
    }
    if (typeof sock.newsletterMetadata === "function") {
      return await sock.newsletterMetadata("jid", channelJid);
    }
  } catch (_) {}
  return null;
}

module.exports = {
  command: "channelstatus",
  aliases: ["chstatus", "cstatus", "channelstory", "chstory", "cnstatus", "cstory"],
  category: "owner",
  description: "Post Channel Status story (24h) on your WhatsApp Channel",
  usage: ".channelstatus <text> | reply media + .channelstatus [caption]",
  ownerOnly: true,

  async handler(sock, message, args, context) {
    context = context || {};
    const chatId = context.chatId || message.key.remoteJid;
    const resolved = resolveChannelJid(args, settings);
    const channelJid = resolved.jid;
    const text = resolved.restArgs.join(" ").trim();
    const media = await getMedia(message);
    const caption = text || (media && media.caption) || "QUEEN AKUMA Channel Status";

    if (!channelJid || String(channelJid).indexOf("@newsletter") === -1) {
      return sock.sendMessage(chatId, {
        text: "❌ channelId missing in settings.js (must be xxx@newsletter)\nOr use: .channelstatus 12036...@newsletter Hello"
      }, { quoted: message });
    }

    if (!media && !text) {
      return sock.sendMessage(chatId, {
        text:
          "*CHANNEL STATUS (Story)*\n\n" +
          "Updates tab pe channel ki 24h story ring.\n\n" +
          "Use:\n" +
          "• .channelstatus <text>\n" +
          "• Reply image/video + .channelstatus [caption]\n" +
          "• .channelstatus 12036...@newsletter Hello\n\n" +
          "Channel: `" + channelJid + "`\n" +
          "Name: " + (settings.channelName || "-") + "\n\n" +
          "The bot must be owner/admin of the channel."
      }, { quoted: message });
    }

    await sock.sendMessage(chatId, { text: "⏳ Publishing channel status..." }, { quoted: message }).catch(function () {});

    const caps = await tryCapabilities(sock, channelJid);
    let method = "";
    let ok = false;
    let lastErr = "";
    let isTrueStatus = false;

    // A) sendNewsletterStatus
    if (!ok && typeof sock.sendNewsletterStatus === "function") {
      try {
        let content;
        if (media && media.type === "image") content = { image: media.buffer, caption: caption };
        else if (media && media.type === "video") content = { video: media.buffer, caption: caption, mimetype: "video/mp4" };
        else content = { text: caption };
        await sock.sendNewsletterStatus(channelJid, content);
        method = "sendNewsletterStatus";
        ok = true;
        isTrueStatus = true;
      } catch (e) {
        lastErr = e.message || String(e);
      }
    }

    // B) IQ status text
    if (!ok && typeof sock.query === "function" && !media) {
      try {
        const msgId = typeof generateMessageID === "function" ? generateMessageID() : Date.now().toString(36);
        await sock.query({
          tag: "status",
          attrs: { to: channelJid, id: msgId, type: "text" },
          content: [{ tag: "plaintext", attrs: {}, content: caption }]
        });
        method = "iqStatusText";
        ok = true;
        isTrueStatus = true;
      } catch (e) {
        lastErr = e.message || String(e);
      }
    }

    // C) relay + statusAttributions type 11
    if (!ok) {
      try {
        const me = (sock.user && sock.user.id ? sock.user.id : "").split(":")[0] + "@s.whatsapp.net";
        const contextInfo = {
          featureEligibilities: { canBeReshared: true },
          statusAttributions: [{ type: 11 }]
        };
        let inner;
        if (media && media.type === "image") {
          const prepared = await prepareWAMessageMedia({ image: media.buffer }, { upload: sock.waUploadToServer });
          inner = { imageMessage: Object.assign({}, prepared.imageMessage, { caption: caption, contextInfo: contextInfo }) };
        } else if (media && media.type === "video") {
          const prepared = await prepareWAMessageMedia({ video: media.buffer }, { upload: sock.waUploadToServer });
          inner = { videoMessage: Object.assign({}, prepared.videoMessage, { caption: caption, mimetype: "video/mp4", contextInfo: contextInfo }) };
        } else {
          inner = { extendedTextMessage: { text: caption, contextInfo: contextInfo } };
        }
        const gen = generateWAMessageFromContent(channelJid, inner, { userJid: me });
        await sock.relayMessage(channelJid, gen.message, { messageId: gen.key.id });
        method = "relayStatusAttribution";
        ok = true;
        isTrueStatus = false;
      } catch (e) {
        lastErr = e.message || String(e);
      }
    }

    // D) fallback channel post
    if (!ok) {
      try {
        let payload;
        if (media && media.type === "image") payload = { image: media.buffer, caption: caption };
        else if (media && media.type === "video") payload = { video: media.buffer, caption: caption, mimetype: "video/mp4" };
        else payload = { text: caption };
        await sock.sendMessage(channelJid, payload);
        method = "channelPost (fallback)";
        ok = true;
        isTrueStatus = false;
      } catch (e) {
        lastErr = e.message || String(e);
      }
    }

    if (ok) {
      const tip = isTrueStatus
        ? "True Channel Status try OK.\nPhone: Updates tab → channel story ring (24h)."
        : "Server accepted message, but it may be a *normal channel post*.\n\n" +
          "True Channel Status needs:\n" +
          "1) App shows Add channel status on that channel\n" +
          "2) Bot is Owner/Admin\n" +
          "3) WhatsApp unlocked feature for that channel (gradual rollout)";

      await sock.sendMessage(chatId, {
        text:
          "*CHANNEL STATUS RESULT*\n\n" +
          "Channel: *" + (settings.channelName || "Channel") + "*\n" +
          "ID: `" + channelJid + "`\n" +
          "Type: " + (media ? media.type : "text") + "\n" +
          "Method: `" + method + "`\n" +
          (caps ? "Caps: `" + JSON.stringify(caps).slice(0, 120) + "`\n" : "") +
          "\n" + tip
      }, { quoted: message });
    } else {
      await sock.sendMessage(chatId, {
        text:
          "❌ Channel Status fail\n\nError: `" + (lastErr || "unknown") + "`\n\n" +
          "Check: bot Owner/Admin? channelId @newsletter? Status feature unlocked in app?"
      }, { quoted: message });
    }
  }
};
