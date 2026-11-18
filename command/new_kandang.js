const { run } = require('../lib/compat');
const META = {
  file: "rpg-kandang.js",
  family: "A",
  command: "kandang",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "kandang",
  aliases: [],
  category: "misc",
  description: "New plugin: kandang",
  usage: ".kandang",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
