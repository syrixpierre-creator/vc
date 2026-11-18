const { run } = require('../lib/compat');
const META = {
  file: "owner-grepplugin.js",
  family: "A",
  command: "grepplugin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "grepplugin",
  aliases: [],
  category: "misc",
  description: "New plugin: grepplugin",
  usage: ".grepplugin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
