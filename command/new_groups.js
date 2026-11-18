const { run } = require('../lib/compat');
const META = {
  file: "info-grouplist.js",
  family: "A",
  command: "groups",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "groups",
  aliases: ["grouplist"],
  category: "misc",
  description: "New plugin: groups",
  usage: ".groups",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
