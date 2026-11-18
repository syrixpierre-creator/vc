const { run } = require('../lib/compat');
const META = {
  file: "maker-pornhublogo.js",
  family: "A",
  command: "phlogo",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "phlogo",
  aliases: [],
  category: "misc",
  description: "New plugin: phlogo",
  usage: ".phlogo",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
