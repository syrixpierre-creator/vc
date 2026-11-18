const { run } = require('../lib/compat');
const META = {
  file: "game-sambungkata.js",
  family: "A",
  command: "sambungkata",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "sambungkata",
  aliases: [],
  category: "misc",
  description: "New plugin: sambungkata",
  usage: ".sambungkata",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
