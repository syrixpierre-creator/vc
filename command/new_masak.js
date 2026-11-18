const { run } = require('../lib/compat');
const META = {
  file: "rpg-cook.js",
  family: "A",
  command: "masak",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "masak",
  aliases: [],
  category: "misc",
  description: "New plugin: masak",
  usage: ".masak",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
