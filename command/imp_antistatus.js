/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for anti-status.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "anti-status.js",
  family: "B",
  command: "antistatus",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "antistatus",
  aliases: [],
  category: "restored",
  description: "Restored: anti-status",
  usage: ".antistatus",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
