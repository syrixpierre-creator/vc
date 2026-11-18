const { run } = require('../lib/compat');
const META = {
  file: "rch.js",
  family: "A",
  command: "wareact",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "wareact",
  aliases: [],
  category: "misc",
  description: "New plugin: wareact",
  usage: ".wareact",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
