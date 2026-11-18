const { run } = require('../lib/compat');
const META = {
  file: "game-tebakwarna.js",
  family: "A",
  command: "tebakwarna",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "tebakwarna",
  aliases: [],
  category: "misc",
  description: "New plugin: tebakwarna",
  usage: ".tebakwarna",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
