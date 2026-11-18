const { run } = require('../lib/compat');
const META = {
  file: "rpg-buyatm.js",
  family: "A",
  command: "buyatm",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "buyatm",
  aliases: [],
  category: "misc",
  description: "New plugin: buyatm",
  usage: ".buyatm",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
