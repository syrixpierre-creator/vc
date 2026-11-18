const { run } = require('../lib/compat');
const META = {
  file: "rpg-buy.js",
  family: "A",
  command: "buy",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "buy",
  aliases: [],
  category: "misc",
  description: "New plugin: buy",
  usage: ".buy",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
