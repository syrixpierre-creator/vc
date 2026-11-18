const { run } = require('../lib/compat');
const META = {
  file: "owner-backup.js",
  family: "A",
  command: "backup",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "backup",
  aliases: [],
  category: "misc",
  description: "New plugin: backup",
  usage: ".backup",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
