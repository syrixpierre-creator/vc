/* QUEEN AKUMA legacy plugin (family B) — converted automatically */
const { cmd } = require('../lib/compat').registrar;

cmd({
  pattern: "jid",
  alias: ["gjid"],
  desc: "Return Group JID (Everyone) or User JID in private chat",
  category: "utility",
  react: "🆔",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, reply, sender }) => {
  try {

    if (isGroup) {
      // Public for all group members
      const groupJID = from.includes("@g.us") ? from : `${from}@g.us`;
      return reply(`👥 Group JID:\n\`\`\`${groupJID}\`\`\``);
    }
    else {
      // Private chat → return sender JID only
      const fixedJID = sender.includes("@") ? sender : `${sender}@s.whatsapp.net`;
      return reply(`👤 User JID:\n\`\`\`${fixedJID}\`\`\``);
    }

  } catch (e) {
    console.error(e);
    return reply("⚠️ Error fetching JID.");
  }
});