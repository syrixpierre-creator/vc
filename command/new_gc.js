const { run } = require('../lib/compat');
const META = {
  file: "group-settings.js",
  family: "A",
  command: "gc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "gc",
  aliases: [],
  category: "misc",
  description: "New plugin: gc",
  usage: ".gc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
