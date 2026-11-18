const { run } = require('../lib/compat');
const META = {
  file: "expired-del.js",
  family: "A",
  command: "delexpired",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "delexpired",
  aliases: [],
  category: "misc",
  description: "New plugin: delexpired",
  usage: ".delexpired",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
