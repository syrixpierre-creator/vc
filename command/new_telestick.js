const { run } = require('../lib/compat');
const META = {
  file: "sticker-telegram.js",
  family: "A",
  command: "telestick",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "telestick",
  aliases: [],
  category: "misc",
  description: "New plugin: telestick",
  usage: ".telestick",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
