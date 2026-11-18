const { run } = require('../lib/compat');
const META = {
  file: "banchat2.js",
  family: "A",
  command: "banchat2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "banchat2",
  aliases: [],
  category: "misc",
  description: "New plugin: banchat2",
  usage: ".banchat2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
