const { run } = require('../lib/compat');
const META = {
  file: "rpg-nebang.js",
  family: "A",
  command: "nebang",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "nebang",
  aliases: [],
  category: "misc",
  description: "New plugin: nebang",
  usage: ".nebang",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
