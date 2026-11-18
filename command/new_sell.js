const { run } = require('../lib/compat');
const META = {
  file: "rpg-sell.js",
  family: "A",
  command: "sell",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "sell",
  aliases: [],
  category: "misc",
  description: "New plugin: sell",
  usage: ".sell",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
