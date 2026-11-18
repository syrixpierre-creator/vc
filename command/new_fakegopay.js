const { run } = require('../lib/compat');
const META = {
  file: "maker-fakegopay.js",
  family: "A",
  command: "fakegopay",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "fakegopay",
  aliases: [],
  category: "misc",
  description: "New plugin: fakegopay",
  usage: ".fakegopay",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
