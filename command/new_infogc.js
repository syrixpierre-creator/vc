const { run } = require('../lib/compat');
const META = {
  file: "group-info.js",
  family: "A",
  command: "infogc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "infogc",
  aliases: [],
  category: "misc",
  description: "New plugin: infogc",
  usage: ".infogc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
