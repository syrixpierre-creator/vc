const { run } = require('../lib/compat');
const META = {
  file: "game-war-attack.js",
  family: "A",
  command: "attack",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "attack",
  aliases: ["atk"],
  category: "misc",
  description: "New plugin: attack",
  usage: ".attack",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
