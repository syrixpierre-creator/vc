/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for trt.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "trt.js",
  family: "B",
  command: "trt",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "trt",
  aliases: [],
  category: "restored",
  description: "Restored: trt",
  usage: ".trt",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
