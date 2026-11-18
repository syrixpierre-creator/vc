const { run } = require('../lib/compat');
const META = {
  file: "rpg-mining.js",
  family: "A",
  command: "mining",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "mining",
  aliases: [],
  category: "misc",
  description: "New plugin: mining",
  usage: ".mining",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
