const { run } = require('../lib/compat');
const META = {
  file: "rpg-upgrade.js",
  family: "A",
  command: "upgradeatm",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "upgradeatm",
  aliases: [],
  category: "misc",
  description: "New plugin: upgradeatm",
  usage: ".upgradeatm",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
