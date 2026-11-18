/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_ss2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_ss2.js",
  family: "A",
  command: "newss2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newss2",
  aliases: [],
  category: "restored",
  description: "Restored: new_ss2",
  usage: ".newss2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
