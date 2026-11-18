/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tool-removbg.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tool-removbg.js",
  family: "A",
  command: "toolremovbg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolremovbg",
  aliases: [],
  category: "restored",
  description: "Restored: tool-removbg",
  usage: ".toolremovbg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
