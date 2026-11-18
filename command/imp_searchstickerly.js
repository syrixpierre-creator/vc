/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for search-stickerly.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "search-stickerly.js",
  family: "A",
  command: "searchstickerly",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "searchstickerly",
  aliases: [],
  category: "restored",
  description: "Restored: search-stickerly",
  usage: ".searchstickerly",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
