/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for info-grouplist.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "info-grouplist.js",
  family: "B",
  command: "infogrouplist",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "infogrouplist",
  aliases: [],
  category: "restored",
  description: "Restored: info-grouplist",
  usage: ".infogrouplist",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
