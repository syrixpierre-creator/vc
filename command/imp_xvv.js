/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for vv.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "vv.js",
  family: "B",
  command: "xvv",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xvv",
  aliases: [],
  category: "restored",
  description: "Restored: vv",
  usage: ".xvv",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
