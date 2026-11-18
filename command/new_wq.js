const { run } = require('../lib/compat');
const META = {
  file: "maker-wq.js",
  family: "A",
  command: "wq",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "wq",
  aliases: [],
  category: "misc",
  description: "New plugin: wq",
  usage: ".wq",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
