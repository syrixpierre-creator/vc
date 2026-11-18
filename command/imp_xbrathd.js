/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for brathd.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "brathd.js",
  family: "A",
  command: "xbrathd",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xbrathd",
  aliases: [],
  category: "restored",
  description: "Restored: brathd",
  usage: ".xbrathd",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
