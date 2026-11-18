const { run } = require('../lib/compat');
const META = {
  file: "bypass.js",
  family: "A",
  command: "bypass",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "bypass",
  aliases: ["bypasslink", "unlocklink"],
  category: "misc",
  description: "New plugin: bypass",
  usage: ".bypass",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
