const { run } = require('../lib/compat');
const META = {
  file: "nsfw-woppai.js",
  family: "A",
  command: "woppai",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "woppai",
  aliases: [],
  category: "misc",
  description: "New plugin: woppai",
  usage: ".woppai",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
