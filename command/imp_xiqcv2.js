/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for Iqcv2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "Iqcv2.js",
  family: "A",
  command: "xiqcv2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xiqcv2",
  aliases: [],
  category: "restored",
  description: "Restored: Iqcv2",
  usage: ".xiqcv2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
