/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_clearchat.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_clearchat.js",
  family: "A",
  command: "newclearchat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newclearchat",
  aliases: [],
  category: "restored",
  description: "Restored: new_clearchat",
  usage: ".newclearchat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
