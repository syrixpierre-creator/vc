const { run } = require('../lib/compat');
const META = {
  file: "owner-banchat.js",
  family: "A",
  command: "banchat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "banchat",
  aliases: [],
  category: "misc",
  description: "New plugin: banchat",
  usage: ".banchat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
