const { run } = require('../lib/compat');
const META = {
  file: "owner-resetlimit.js",
  family: "A",
  command: "resetlimit",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "resetlimit",
  aliases: [],
  category: "misc",
  description: "New plugin: resetlimit",
  usage: ".resetlimit",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
