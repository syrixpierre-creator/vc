const { run } = require('../lib/compat');
const META = {
  file: "xp-unregister.js",
  family: "A",
  command: "unreg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "unreg",
  aliases: [],
  category: "misc",
  description: "New plugin: unreg",
  usage: ".unreg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
