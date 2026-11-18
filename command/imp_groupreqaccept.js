/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-req-accept.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-req-accept.js",
  family: "B",
  command: "groupreqaccept",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupreqaccept",
  aliases: [],
  category: "restored",
  description: "Restored: group-req-accept",
  usage: ".groupreqaccept",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
