const { run } = require('../lib/compat');
const META = {
  file: "rpg-bansos.js",
  family: "A",
  command: "korupsi",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "korupsi",
  aliases: [],
  category: "misc",
  description: "New plugin: korupsi",
  usage: ".korupsi",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
