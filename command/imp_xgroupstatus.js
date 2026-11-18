/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for groupstatus.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "groupstatus.js",
  family: "B",
  command: "xgroupstatus",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xgroupstatus",
  aliases: [],
  category: "restored",
  description: "Restored: groupstatus",
  usage: ".xgroupstatus",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
