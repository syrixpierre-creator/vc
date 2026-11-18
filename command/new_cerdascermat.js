const { run } = require('../lib/compat');
const META = {
  file: "game-cerdascermat.js",
  family: "A",
  command: "cerdascermat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "cerdascermat",
  aliases: ["cc"],
  category: "misc",
  description: "New plugin: cerdascermat",
  usage: ".cerdascermat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
