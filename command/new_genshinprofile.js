const { run } = require('../lib/compat');
const META = {
  file: "game-genshinprofile.js",
  family: "A",
  command: "genshinprofile",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "genshinprofile",
  aliases: [],
  category: "misc",
  description: "New plugin: genshinprofile",
  usage: ".genshinprofile",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
