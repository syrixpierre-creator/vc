const { run } = require('../lib/compat');
const META = {
  file: "rpg-quest.js",
  family: "A",
  command: "quest",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "quest",
  aliases: [],
  category: "misc",
  description: "New plugin: quest",
  usage: ".quest",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
