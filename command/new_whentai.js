const { run } = require('../lib/compat');
const META = {
  file: "nsfw-whentai.js",
  family: "A",
  command: "whentai",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "whentai",
  aliases: [],
  category: "misc",
  description: "New plugin: whentai",
  usage: ".whentai",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
