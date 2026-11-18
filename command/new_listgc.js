const { run } = require('../lib/compat');
const META = {
  file: "owner-listgc.js",
  family: "A",
  command: "listgc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "listgc",
  aliases: [],
  category: "misc",
  description: "New plugin: listgc",
  usage: ".listgc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
