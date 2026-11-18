const { run } = require('../lib/compat');
const META = {
  file: "withdraw.js",
  family: "A",
  command: "withdraw",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "withdraw",
  aliases: [],
  category: "misc",
  description: "New plugin: withdraw",
  usage: ".withdraw",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
