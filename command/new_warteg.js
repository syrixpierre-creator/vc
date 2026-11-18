const { run } = require('../lib/compat');
const META = {
  file: "rpg-warteg.js",
  family: "A",
  command: "warteg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "warteg",
  aliases: [],
  category: "misc",
  description: "New plugin: warteg",
  usage: ".warteg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
