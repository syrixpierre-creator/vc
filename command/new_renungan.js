const { run } = require('../lib/compat');
const META = {
  file: "renungan.js",
  family: "A",
  command: "renungan",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "renungan",
  aliases: [],
  category: "misc",
  description: "New plugin: renungan",
  usage: ".renungan",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
