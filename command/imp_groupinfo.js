/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-info.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-info.js",
  family: "B",
  command: "groupinfo",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupinfo",
  aliases: [],
  category: "restored",
  description: "Restored: group-info",
  usage: ".groupinfo",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
