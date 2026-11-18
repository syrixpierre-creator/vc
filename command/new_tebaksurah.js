const { run } = require('../lib/compat');
const META = {
  file: "game-tebaksurah.js",
  family: "A",
  command: "tebaksurah",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "tebaksurah",
  aliases: [],
  category: "misc",
  description: "New plugin: tebaksurah",
  usage: ".tebaksurah",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
