const { run } = require('../lib/compat');
const META = {
  file: "rpg-inventory.js",
  family: "A",
  command: "inventory",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "inventory",
  aliases: ["inv"],
  category: "misc",
  description: "New plugin: inventory",
  usage: ".inventory",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
