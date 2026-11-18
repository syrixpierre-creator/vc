const { run } = require('../lib/compat');
const META = {
  file: "rpg-casino.js",
  family: "A",
  command: "casino",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "casino",
  aliases: [],
  category: "misc",
  description: "New plugin: casino",
  usage: ".casino",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
