const { run } = require('../lib/compat');
const META = {
  file: "main-order.js",
  family: "A",
  command: "order",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "order",
  aliases: [],
  category: "misc",
  description: "New plugin: order",
  usage: ".order",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
