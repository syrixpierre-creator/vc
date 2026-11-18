/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for statusdl.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "statusdl.js",
  family: "A",
  command: "statusdl",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "statusdl",
  aliases: [],
  category: "restored",
  description: "Restored: statusdl",
  usage: ".statusdl",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
