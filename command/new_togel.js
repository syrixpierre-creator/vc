const { run } = require('../lib/compat');
const META = {
  file: "game-togel.js",
  family: "A",
  command: "togel",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "togel",
  aliases: ["stoptogel"],
  category: "misc",
  description: "New plugin: togel",
  usage: ".togel",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
