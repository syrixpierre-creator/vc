const { run } = require('../lib/compat');
const META = {
  file: "rpg-deposit.js",
  family: "A",
  command: "deposit",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "deposit",
  aliases: [],
  category: "misc",
  description: "New plugin: deposit",
  usage: ".deposit",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
