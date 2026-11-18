const { run } = require('../lib/compat');
const META = {
  file: "rpg-shop.js",
  family: "A",
  command: "shop",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "shop",
  aliases: [],
  category: "misc",
  description: "New plugin: shop",
  usage: ".shop",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
