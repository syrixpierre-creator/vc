/* QUEEN AKUMA legacy plugin (family B) — converted automatically */
const { cmd } = require('../lib/compat').registrar;

cmd({
  pattern: "vv",
  alias: ["viewonce", "retrieve"],
  react: "🐳",
  desc: "Owner Only - retrieve view once message",
  category: "owner",
  filename: __filename
}, async (client, m, store, { from, isCreator, reply }) => {
  try {
    if (!isCreator) return reply("*📛 This is an owner command.*");

    if (!m.quoted) {
      return reply("*🍁 Please reply to a view-once image / video / audio!*");
    }

    const quoted = m.quoted;

    if (!quoted.viewOnce) {
      return reply("❌ This message is not a view-once message.");
    }

    const buffer = await quoted.download();
    if (!buffer) return reply("❌ Failed to download message.");

    const footer = `> *POWERED BY QUEEN AKUMA ⚡*`;

    const text = (quoted.text || quoted.caption || quoted.body || "").trim();

    const caption = text
      ? `${text}\n\n${footer}`
      : `${footer}`;

    const contextInfo = {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363403408693274@newsletter',
        newsletterName: "QUEEN AKUMA",
        serverMessageId: Date.now()
      }
    };

    let content = {};

    if (quoted.mtype === "imageMessage") {
      content = {
        image: buffer,
        caption,
        contextInfo
      };
    }
    else if (quoted.mtype === "videoMessage") {
      content = {
        video: buffer,
        caption,
        contextInfo
      };
    }
    else if (quoted.mtype === "audioMessage") {
      content = {
        audio: buffer,
        mimetype: "audio/mp4",
        ptt: quoted.ptt || false,
        contextInfo
      };
    }
    else {
      return reply("❌ Only image, video, and audio messages are supported.");
    }

    await client.sendMessage(from, content, { quoted: m });

  } catch (error) {
    console.error("vv Error:", error);
    reply("❌ Error fetching view-once message.");
  }
});
