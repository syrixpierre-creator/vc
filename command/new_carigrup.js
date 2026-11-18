const { run } = require('../lib/compat');
const META = {
  file: "search-carigrup.js",
  family: "A",
  command: "carigrup",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "carigrup",
  aliases: [],
  category: "misc",
  description: "New plugin: carigrup",
  usage: ".carigrup",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
