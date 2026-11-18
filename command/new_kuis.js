const { run } = require('../lib/compat');
const META = {
  file: "game-kuis.js",
  family: "A",
  command: "kuis",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "kuis",
  aliases: [],
  category: "misc",
  description: "New plugin: kuis",
  usage: ".kuis",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
