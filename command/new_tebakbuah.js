const { run } = require('../lib/compat');
const META = {
  file: "game-tebakbuah.js",
  family: "A",
  command: "tebakbuah",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "tebakbuah",
  aliases: [],
  category: "misc",
  description: "New plugin: tebakbuah",
  usage: ".tebakbuah",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
