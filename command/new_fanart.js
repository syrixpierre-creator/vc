const { run } = require('../lib/compat');
const META = {
  file: "anime-fanart.js",
  family: "A",
  command: "fanart",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "fanart",
  aliases: [],
  category: "misc",
  description: "New plugin: fanart",
  usage: ".fanart",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
