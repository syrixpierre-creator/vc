/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for antisticker.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "antisticker.js",
  family: "B",
  command: "xantisticker",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xantisticker",
  aliases: [],
  category: "restored",
  description: "Restored: antisticker",
  usage: ".xantisticker",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
