/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-hidetag.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-hidetag.js",
  family: "B",
  command: "grouphidetag",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "grouphidetag",
  aliases: [],
  category: "restored",
  description: "Restored: group-hidetag",
  usage: ".grouphidetag",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
