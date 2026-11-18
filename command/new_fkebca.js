const { run } = require('../lib/compat');
const META = {
  file: "maker-fakebca.js",
  family: "A",
  command: "fkebca",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "fkebca",
  aliases: [],
  category: "misc",
  description: "New plugin: fkebca",
  usage: ".fkebca",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
