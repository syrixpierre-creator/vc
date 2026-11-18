const { run } = require('../lib/compat');
const META = {
  file: "game-tebakjkt.js",
  family: "A",
  command: "tebakjkt",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "tebakjkt",
  aliases: [],
  category: "misc",
  description: "New plugin: tebakjkt",
  usage: ".tebakjkt",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
