const { run } = require('../lib/compat');
const META = {
  file: "game-bonanza.js",
  family: "A",
  command: "bonanza",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "bonanza",
  aliases: [],
  category: "misc",
  description: "New plugin: bonanza",
  usage: ".bonanza",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
