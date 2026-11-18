const { run } = require('../lib/compat');
const META = {
  file: "owner-addlimit.js",
  family: "A",
  command: "addlimit",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "addlimit",
  aliases: [],
  category: "misc",
  description: "New plugin: addlimit",
  usage: ".addlimit",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
