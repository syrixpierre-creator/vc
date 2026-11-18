const { run } = require('../lib/compat');
const META = {
  file: "rpg-kerja.js",
  family: "A",
  command: "kerja",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "kerja",
  aliases: ["work"],
  category: "misc",
  description: "New plugin: kerja",
  usage: ".kerja",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
