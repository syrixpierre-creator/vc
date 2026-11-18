const { run } = require('../lib/compat');
const META = {
  file: "rpg-hunt.js",
  family: "A",
  command: "hunt",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "hunt",
  aliases: [],
  category: "misc",
  description: "New plugin: hunt",
  usage: ".hunt",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
