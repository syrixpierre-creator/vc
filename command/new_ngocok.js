const { run } = require('../lib/compat');
const META = {
  file: "rpg-ngocok.js",
  family: "A",
  command: "ngocok",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "ngocok",
  aliases: [],
  category: "misc",
  description: "New plugin: ngocok",
  usage: ".ngocok",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
