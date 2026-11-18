const { run } = require('../lib/compat');
const META = {
  file: "nsfw-hentai.js",
  family: "A",
  command: "hentai",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "hentai",
  aliases: [],
  category: "misc",
  description: "New plugin: hentai",
  usage: ".hentai",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
