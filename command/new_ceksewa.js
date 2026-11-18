const { run } = require('../lib/compat');
const META = {
  file: "ceksewa.js",
  family: "A",
  command: "ceksewa",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "ceksewa",
  aliases: [],
  category: "misc",
  description: "New plugin: ceksewa",
  usage: ".ceksewa",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
