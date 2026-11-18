const { run } = require('../lib/compat');
const META = {
  file: "rpg-jual.js",
  family: "A",
  command: "jual",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "jual",
  aliases: [],
  category: "misc",
  description: "New plugin: jual",
  usage: ".jual",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
