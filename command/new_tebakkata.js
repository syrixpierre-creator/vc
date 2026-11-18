const { run } = require('../lib/compat');
const META = {
  file: "game-tebakkata.js",
  family: "A",
  command: "tebakkata",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "tebakkata",
  aliases: [],
  category: "misc",
  description: "New plugin: tebakkata",
  usage: ".tebakkata",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
