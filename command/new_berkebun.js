const { run } = require('../lib/compat');
const META = {
  file: "rpg-berkebon.js",
  family: "A",
  command: "berkebun",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "berkebun",
  aliases: [],
  category: "misc",
  description: "New plugin: berkebun",
  usage: ".berkebun",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
