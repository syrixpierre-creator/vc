const { run } = require('../lib/compat');
const META = {
  file: "rpg-mulung.js",
  family: "A",
  command: "mulung",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "mulung",
  aliases: [],
  category: "misc",
  description: "New plugin: mulung",
  usage: ".mulung",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
