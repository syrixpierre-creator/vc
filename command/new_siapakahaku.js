const { run } = require('../lib/compat');
const META = {
  file: "game-siapakahaku.js",
  family: "A",
  command: "siapakahaku",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "siapakahaku",
  aliases: [],
  category: "misc",
  description: "New plugin: siapakahaku",
  usage: ".siapakahaku",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
