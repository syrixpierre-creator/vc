const { run } = require('../lib/compat');
const META = {
  file: "owner-balas.js",
  family: "A",
  command: "balas",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "balas",
  aliases: [],
  category: "misc",
  description: "New plugin: balas",
  usage: ".balas",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
