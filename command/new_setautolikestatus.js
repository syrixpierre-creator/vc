const { run } = require('../lib/compat');
const META = {
  file: "settings2.js",
  family: "B",
  command: "setautolikestatus",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "setautolikestatus",
  // REMOVED broken aliases that pointed to missing black_hat:
  // setautoreact, setautoreply, setautobio, setautoblock, setautoread, setstatusemojis...
  // Use QUEEN AKUMA commands instead: .autoreact .autostatus .autoread .autoreply
  aliases: ["setstatuslike", "autolikestatus"],
  category: "misc",
  description: "Auto like status (legacy wrapper — may need black_hat)",
  usage: ".setautolikestatus",
  async handler(sock, message, args, context = {}) {
    try {
      return await run(META, sock, message, args, context);
    } catch (e) {
      const chatId = context.chatId || message.key.remoteJid;
      await sock.sendMessage(chatId, {
        text:
          '⚠️ This legacy command is incomplete.\n\n' +
          'Use QUEEN AKUMA commands:\n' +
          '• `.autoreact on/off`\n' +
          '• `.autostatus on` + `.autostatus react on`\n' +
          '• `.autoread on/off`'
      }, { quoted: message });
    }
  }
};
