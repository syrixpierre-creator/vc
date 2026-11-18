const { run } = require('../lib/compat');
const META = {
  file: "rpg-adventure.js",
  family: "A",
  command: "petualang",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "petualang",
  aliases: [],
  category: "misc",
  description: "New plugin: petualang",
  usage: ".petualang",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
