/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for search-bingimage.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "search-bingimage.js",
  family: "B",
  command: "searchbingimage",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "searchbingimage",
  aliases: [],
  category: "restored",
  description: "Restored: search-bingimage",
  usage: ".searchbingimage",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
