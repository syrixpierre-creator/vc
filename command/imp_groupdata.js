/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for groupdata.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "groupdata.js",
  family: "B",
  command: "groupdata",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupdata",
  aliases: [],
  category: "restored",
  description: "Restored: groupdata",
  usage: ".groupdata",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
