const { run } = require('../lib/compat');
const META = {
  file: "game-tebakbendera.js",
  family: "A",
  command: "tebakbendera",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "tebakbendera",
  aliases: [],
  category: "misc",
  description: "New plugin: tebakbendera",
  usage: ".tebakbendera",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
