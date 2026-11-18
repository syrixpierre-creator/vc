const { run } = require('../lib/compat');
const META = {
  file: "owner-sesi.js",
  family: "A",
  command: "getsession",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "getsession",
  aliases: [],
  category: "misc",
  description: "New plugin: getsession",
  usage: ".getsession",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
