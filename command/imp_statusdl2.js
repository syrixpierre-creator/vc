/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for statusdl2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "statusdl2.js",
  family: "B",
  command: "statusdl2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "statusdl2",
  aliases: [],
  category: "restored",
  description: "Restored: statusdl2",
  usage: ".statusdl2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
