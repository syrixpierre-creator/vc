/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for adminlist.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "adminlist.js",
  family: "B",
  command: "adminlist",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "adminlist",
  aliases: [],
  category: "restored",
  description: "Restored: adminlist",
  usage: ".adminlist",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
