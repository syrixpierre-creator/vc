/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-req-reject.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-req-reject.js",
  family: "B",
  command: "groupreqreject",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupreqreject",
  aliases: [],
  category: "restored",
  description: "Restored: group-req-reject",
  usage: ".groupreqreject",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
