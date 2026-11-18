const { run } = require('../lib/compat');
const META = {
  file: "game-suitpvp.js",
  family: "A",
  command: "suitpvp",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "suitpvp",
  aliases: [],
  category: "misc",
  description: "New plugin: suitpvp",
  usage: ".suitpvp",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
