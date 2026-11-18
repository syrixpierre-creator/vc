const { run } = require('../lib/compat');
const META = {
  file: "nsfw-rule34.js",
  family: "A",
  command: "rule34",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "rule34",
  aliases: [],
  category: "misc",
  description: "New plugin: rule34",
  usage: ".rule34",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
