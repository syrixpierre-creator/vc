const { run } = require('../lib/compat');
const META = {
  file: "rpg-me.js",
  family: "A",
  command: "merpg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "merpg",
  aliases: [],
  category: "misc",
  description: "New plugin: merpg",
  usage: ".merpg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
