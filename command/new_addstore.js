const { run } = require('../lib/compat');
const META = {
  file: "store-addlist.js",
  family: "A",
  command: "addstore",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "addstore",
  aliases: ["liststore", "getstore", "delstore"],
  category: "misc",
  description: "New plugin: addstore",
  usage: ".addstore",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
