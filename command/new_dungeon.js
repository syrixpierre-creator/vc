const { run } = require('../lib/compat');
const META = {
  file: "rpg-dungeon.js",
  family: "A",
  command: "dungeon",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "dungeon",
  aliases: [],
  category: "misc",
  description: "New plugin: dungeon",
  usage: ".dungeon",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
