const { run } = require('../lib/compat');
const META = {
  file: "rpg-ceklevel.js",
  family: "A",
  command: "ceklvl",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "ceklvl",
  aliases: [],
  category: "misc",
  description: "New plugin: ceklvl",
  usage: ".ceklvl",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
