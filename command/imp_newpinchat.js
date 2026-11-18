/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_pinchat.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_pinchat.js",
  family: "A",
  command: "newpinchat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newpinchat",
  aliases: [],
  category: "restored",
  description: "Restored: new_pinchat",
  usage: ".newpinchat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
