const { run } = require('../lib/compat');
const META = {
  file: "maker-wacall.js",
  family: "A",
  command: "wacall",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "wacall",
  aliases: [],
  category: "misc",
  description: "New plugin: wacall",
  usage: ".wacall",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
