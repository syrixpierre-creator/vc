const { run } = require('../lib/compat');
const META = {
  file: "owner-sfp.js",
  family: "A",
  command: "sfp",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "sfp",
  aliases: [],
  category: "misc",
  description: "New plugin: sfp",
  usage: ".sfp",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
