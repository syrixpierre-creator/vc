const { run } = require('../lib/compat');
const META = {
  file: "rpg-nguli.js",
  family: "A",
  command: "nguli",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "nguli",
  aliases: [],
  category: "misc",
  description: "New plugin: nguli",
  usage: ".nguli",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
