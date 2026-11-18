const { run } = require('../lib/compat');
const META = {
  file: "game-tebaklogo.js",
  family: "A",
  command: "tebaklogo",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "tebaklogo",
  aliases: [],
  category: "misc",
  description: "New plugin: tebaklogo",
  usage: ".tebaklogo",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
