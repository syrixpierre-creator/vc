/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for stickerly2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "stickerly2.js",
  family: "B",
  command: "xstickerly2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xstickerly2",
  aliases: [],
  category: "restored",
  description: "Restored: stickerly2",
  usage: ".xstickerly2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
