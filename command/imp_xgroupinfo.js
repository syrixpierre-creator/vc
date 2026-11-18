/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for groupinfo.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "groupinfo.js",
  family: "A",
  command: "xgroupinfo",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xgroupinfo",
  aliases: [],
  category: "restored",
  description: "Restored: groupinfo",
  usage: ".xgroupinfo",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
