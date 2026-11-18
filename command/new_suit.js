const { run } = require('../lib/compat');
const META = {
  file: "game-suit.js",
  family: "A",
  command: "suit",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "suit",
  aliases: [],
  category: "misc",
  description: "New plugin: suit",
  usage: ".suit",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
