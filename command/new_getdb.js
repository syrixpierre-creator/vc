const { run } = require('../lib/compat');
const META = {
  file: "owner-getdb.js",
  family: "A",
  command: "getdb",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "getdb",
  aliases: [],
  category: "misc",
  description: "New plugin: getdb",
  usage: ".getdb",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
