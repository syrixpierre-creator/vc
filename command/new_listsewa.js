const { run } = require('../lib/compat');
const META = {
  file: "listsewa.js",
  family: "A",
  command: "listsewa",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "listsewa",
  aliases: [],
  category: "misc",
  description: "New plugin: listsewa",
  usage: ".listsewa",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
