const { run } = require('../lib/compat');
const META = {
  file: "owner-pushkontak.js",
  family: "A",
  command: "pushkontak",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "pushkontak",
  aliases: [],
  category: "misc",
  description: "New plugin: pushkontak",
  usage: ".pushkontak",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
