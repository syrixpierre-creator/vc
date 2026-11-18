const { run } = require('../lib/compat');
const META = {
  file: "rpg-berdagang.js",
  family: "A",
  command: "berdagang",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "berdagang",
  aliases: [],
  category: "misc",
  description: "New plugin: berdagang",
  usage: ".berdagang",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
