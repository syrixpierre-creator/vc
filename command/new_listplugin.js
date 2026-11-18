const { run } = require('../lib/compat');
const META = {
  file: "owner-listplugin.js",
  family: "A",
  command: "listplugin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "listplugin",
  aliases: [],
  category: "misc",
  description: "New plugin: listplugin",
  usage: ".listplugin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
