/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ytstalk.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ytstalk.js",
  family: "B",
  command: "xytstalk",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xytstalk",
  aliases: [],
  category: "restored",
  description: "Restored: ytstalk",
  usage: ".xytstalk",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
