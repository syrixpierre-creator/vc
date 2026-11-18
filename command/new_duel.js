const { run } = require('../lib/compat');
const META = {
  file: "rpg-duel.js",
  family: "A",
  command: "duel",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "duel",
  aliases: [],
  category: "misc",
  description: "New plugin: duel",
  usage: ".duel",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
