const { run } = require('../lib/compat');
const META = {
  file: "anti-mod.js",
  family: "B",
  command: 'antistickeralt',
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "antisticker",
  aliases: ["antistatusmention", "setantidelete", "badwords"],
  category: "misc",
  description: "New plugin: antisticker",
  usage: ".antisticker",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
