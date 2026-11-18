const { run } = require('../lib/compat');
const META = {
  file: "rpg-setrpg.js",
  family: "A",
  command: "setrpg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "setrpg",
  aliases: [],
  category: "misc",
  description: "New plugin: setrpg",
  usage: ".setrpg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
