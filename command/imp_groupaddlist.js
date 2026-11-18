/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-addlist.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-addlist.js",
  family: "B",
  command: "groupaddlist",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupaddlist",
  aliases: [],
  category: "restored",
  description: "Restored: group-addlist",
  usage: ".groupaddlist",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
