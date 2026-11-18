const { run } = require('../lib/compat');
const META = {
  file: "rpg-heal.js",
  family: "A",
  command: "heal",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "heal",
  aliases: [],
  category: "misc",
  description: "New plugin: heal",
  usage: ".heal",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
