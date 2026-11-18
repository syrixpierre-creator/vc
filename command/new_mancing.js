const { run } = require('../lib/compat');
const META = {
  file: "rpg-mancing.js",
  family: "A",
  command: "mancing",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "mancing",
  aliases: [],
  category: "misc",
  description: "New plugin: mancing",
  usage: ".mancing",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
