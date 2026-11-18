const { run } = require('../lib/compat');
const META = {
  file: "owner-deluser.js",
  family: "A",
  command: "deleteuser",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "deleteuser",
  aliases: [],
  category: "misc",
  description: "New plugin: deleteuser",
  usage: ".deleteuser",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
