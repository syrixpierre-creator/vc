/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for antistatus.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "antistatus.js",
  family: "B",
  command: "xantistatus",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xantistatus",
  aliases: [],
  category: "restored",
  description: "Restored: antistatus",
  usage: ".xantistatus",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
