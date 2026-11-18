/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for store-addlist.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "store-addlist.js",
  family: "B",
  command: "storeaddlist",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "storeaddlist",
  aliases: [],
  category: "restored",
  description: "Restored: store-addlist",
  usage: ".storeaddlist",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
