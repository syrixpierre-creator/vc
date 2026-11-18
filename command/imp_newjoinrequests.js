/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_joinrequests.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_joinrequests.js",
  family: "B",
  command: "newjoinrequests",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newjoinrequests",
  aliases: [],
  category: "restored",
  description: "Restored: new_joinrequests",
  usage: ".newjoinrequests",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
