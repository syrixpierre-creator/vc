const { run } = require('../lib/compat');
const META = {
  file: "maker-ngl.js",
  family: "A",
  command: "ngl",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "ngl",
  aliases: [],
  category: "misc",
  description: "New plugin: ngl",
  usage: ".ngl",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
