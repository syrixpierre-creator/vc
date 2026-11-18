const { run } = require('../lib/compat');
const META = {
  file: "rpg-cooldown.js",
  family: "A",
  command: "cooldown",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "cooldown",
  aliases: [],
  category: "misc",
  description: "New plugin: cooldown",
  usage: ".cooldown",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
