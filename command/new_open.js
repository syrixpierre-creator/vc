const { run } = require('../lib/compat');
const META = {
  file: "rpg-open.js",
  family: "A",
  command: "open",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "open",
  aliases: [],
  category: "misc",
  description: "New plugin: open",
  usage: ".open",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
