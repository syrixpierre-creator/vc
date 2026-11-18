const { run } = require('../lib/compat');
const META = {
  file: "rpg-merampok.js",
  family: "A",
  command: "merampok",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "merampok",
  aliases: [],
  category: "misc",
  description: "New plugin: merampok",
  usage: ".merampok",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
