const { run } = require('../lib/compat');
const META = {
  file: "nsfw-wfauzuri.js",
  family: "A",
  command: "wpaizuri",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "wpaizuri",
  aliases: [],
  category: "misc",
  description: "New plugin: wpaizuri",
  usage: ".wpaizuri",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
