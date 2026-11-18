/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for stickerly.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "stickerly.js",
  family: "B",
  command: "stickerly",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickerly",
  aliases: [],
  category: "restored",
  description: "Restored: stickerly",
  usage: ".stickerly",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
