const { run } = require('../lib/compat');
const META = {
  file: "rpg-atm.js",
  family: "A",
  command: "atm",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "atm",
  aliases: [],
  category: "misc",
  description: "New plugin: atm",
  usage: ".atm",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
