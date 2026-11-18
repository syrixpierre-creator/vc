const { run } = require('../lib/compat');
const META = {
  file: "rpg-eat.js",
  family: "A",
  command: "makan",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "makan",
  aliases: [],
  category: "misc",
  description: "New plugin: makan",
  usage: ".makan",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
