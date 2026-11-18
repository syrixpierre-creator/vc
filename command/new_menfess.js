const { run } = require('../lib/compat');
const META = {
  file: "memfess.js",
  family: "A",
  command: "menfess",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "menfess",
  aliases: ["menfes", "confess", "confes", "memfess"],
  category: "misc",
  description: "New plugin: menfess",
  usage: ".menfess",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
