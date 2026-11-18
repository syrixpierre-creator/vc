const { run } = require('../lib/compat');
const META = {
  file: "rpg-berburu.js",
  family: "A",
  command: "berburu",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "berburu",
  aliases: [],
  category: "misc",
  description: "New plugin: berburu",
  usage: ".berburu",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
