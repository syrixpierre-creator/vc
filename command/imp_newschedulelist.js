/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_schedulelist.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_schedulelist.js",
  family: "A",
  command: "newschedulelist",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newschedulelist",
  aliases: [],
  category: "restored",
  description: "Restored: new_schedulelist",
  usage: ".newschedulelist",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
