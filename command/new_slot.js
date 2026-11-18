const { run } = require('../lib/compat');
const META = {
  file: "game-slot.js",
  family: "A",
  command: "slot",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "slot",
  aliases: [],
  category: "misc",
  description: "New plugin: slot",
  usage: ".slot",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
