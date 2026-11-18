const { run } = require('../lib/compat');
const META = {
  file: "game-dadu.js",
  family: "A",
  command: "dadu",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "dadu",
  aliases: [],
  category: "misc",
  description: "New plugin: dadu",
  usage: ".dadu",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
