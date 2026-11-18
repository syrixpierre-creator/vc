/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_blocklist.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_blocklist.js",
  family: "A",
  command: "newblocklist",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newblocklist",
  aliases: [],
  category: "restored",
  description: "Restored: new_blocklist",
  usage: ".newblocklist",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
