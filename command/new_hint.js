const { run } = require('../lib/compat');
const META = {
  file: "game-family100-hint.js",
  family: "A",
  command: "hint",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "hint",
  aliases: [],
  category: "misc",
  description: "New plugin: hint",
  usage: ".hint",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
