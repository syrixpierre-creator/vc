const { run } = require('../lib/compat');
const META = {
  file: "wrml.js",
  family: "A",
  command: "wrml",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "wrml",
  aliases: [],
  category: "misc",
  description: "New plugin: wrml",
  usage: ".wrml",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
