/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sand.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sand.js",
  family: "B",
  command: "sand",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "sand",
  aliases: [],
  category: "restored",
  description: "Restored: sand",
  usage: ".sand",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
