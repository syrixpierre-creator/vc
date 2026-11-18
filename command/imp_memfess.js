/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for memfess.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "memfess.js",
  family: "B",
  command: "memfess",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "memfess",
  aliases: [],
  category: "restored",
  description: "Restored: memfess",
  usage: ".memfess",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
