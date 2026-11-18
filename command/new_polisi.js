const { run } = require('../lib/compat');
const META = {
  file: "rpg-polisi.js",
  family: "A",
  command: "polisi",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "polisi",
  aliases: [],
  category: "misc",
  description: "New plugin: polisi",
  usage: ".polisi",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
