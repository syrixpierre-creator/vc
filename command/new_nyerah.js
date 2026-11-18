const { run } = require('../lib/compat');
const META = {
  file: "game-nyerah.js",
  family: "A",
  command: "nyerah",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "nyerah",
  aliases: [],
  category: "misc",
  description: "New plugin: nyerah",
  usage: ".nyerah",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
