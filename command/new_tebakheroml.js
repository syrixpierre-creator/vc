const { run } = require('../lib/compat');
const META = {
  file: "game-tebakheroml.js",
  family: "A",
  command: "tebakheroml",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "tebakheroml",
  aliases: [],
  category: "misc",
  description: "New plugin: tebakheroml",
  usage: ".tebakheroml",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
