/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-removebg.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-removebg.js",
  family: "B",
  command: "toolsremovebg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsremovebg",
  aliases: [],
  category: "restored",
  description: "Restored: tools-removebg",
  usage: ".toolsremovebg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
