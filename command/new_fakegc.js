const { run } = require('../lib/compat');
const META = {
  file: "maker-iosgc.js",
  family: "A",
  command: "fakegc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "fakegc",
  aliases: ["fakegrup"],
  category: "misc",
  description: "New plugin: fakegc",
  usage: ".fakegc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
