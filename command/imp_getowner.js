/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for get-owner.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "get-owner.js",
  family: "B",
  command: "getowner",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "getowner",
  aliases: [],
  category: "restored",
  description: "Restored: get-owner",
  usage: ".getowner",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
