const { run } = require('../lib/compat');
const META = {
  file: "prem-jadibot.js",
  family: "A",
  command: "jadibot",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "jadibot",
  aliases: ["stopjadibot", "listjadibot", "listjadirbot"],
  category: "misc",
  description: "New plugin: jadibot",
  usage: ".jadibot",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
