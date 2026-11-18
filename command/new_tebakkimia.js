const { run } = require('../lib/compat');
const META = {
  file: "game-tebakkimia.js",
  family: "A",
  command: "tebakkimia",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "tebakkimia",
  aliases: [],
  category: "misc",
  description: "New plugin: tebakkimia",
  usage: ".tebakkimia",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
