const { run } = require('../lib/compat');
const META = {
  file: "nsfw-wecchi.js",
  family: "A",
  command: "wecchi",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "wecchi",
  aliases: [],
  category: "misc",
  description: "New plugin: wecchi",
  usage: ".wecchi",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
