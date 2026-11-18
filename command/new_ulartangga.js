const { run } = require('../lib/compat');
const META = {
  file: "game-ulartangga.js",
  family: "A",
  command: "ulartangga",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "ulartangga",
  aliases: [],
  category: "misc",
  description: "New plugin: ulartangga",
  usage: ".ulartangga",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
