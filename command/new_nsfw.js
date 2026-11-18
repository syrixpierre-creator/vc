const { run } = require('../lib/compat');
const META = {
  file: "nsfw.js",
  family: "A",
  command: "nsfw",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "nsfw",
  aliases: [],
  category: "misc",
  description: "New plugin: nsfw",
  usage: ".nsfw",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
