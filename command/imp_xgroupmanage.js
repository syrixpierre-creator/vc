/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for groupmanage.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "groupmanage.js",
  family: "B",
  command: "xgroupmanage",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xgroupmanage",
  aliases: [],
  category: "restored",
  description: "Restored: groupmanage",
  usage: ".xgroupmanage",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
