const { run } = require('../lib/compat');
const META = {
  file: "tools-breach.js",
  family: "A",
  command: "breach",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "breach",
  aliases: [],
  category: "misc",
  description: "New plugin: breach",
  usage: ".breach",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
