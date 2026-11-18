const { run } = require('../lib/compat');
const META = {
  file: "game-tebakgame.js",
  family: "A",
  command: "tebakgame",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "tebakgame",
  aliases: [],
  category: "misc",
  description: "New plugin: tebakgame",
  usage: ".tebakgame",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
