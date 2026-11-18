const { run } = require('../lib/compat');
const META = {
  file: "rpg-levelup.js",
  family: "A",
  command: "levelup",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "levelup",
  aliases: [],
  category: "misc",
  description: "New plugin: levelup",
  usage: ".levelup",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
