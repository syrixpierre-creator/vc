/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for grouplink.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "grouplink.js",
  family: "B",
  command: "xgrouplink",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xgrouplink",
  aliases: [],
  category: "restored",
  description: "Restored: grouplink",
  usage: ".xgrouplink",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
