const { run } = require('../lib/compat');
const META = {
  file: "main-menu.js",
  family: "A",
  command: "perintah",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "perintah",
  aliases: [],
  category: "misc",
  description: "New plugin: perintah",
  usage: ".perintah",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
