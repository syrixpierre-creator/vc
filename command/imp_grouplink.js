/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-link.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-link.js",
  family: "B",
  command: "grouplink",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "grouplink",
  aliases: [],
  category: "restored",
  description: "Restored: group-link",
  usage: ".grouplink",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
