const { run } = require('../lib/compat');
const META = {
  file: "owner-sf.js",
  family: "A",
  command: "saveplugin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "saveplugin",
  aliases: [],
  category: "misc",
  description: "New plugin: saveplugin",
  usage: ".saveplugin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
