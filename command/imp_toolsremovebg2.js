/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-removebg2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-removebg2.js",
  family: "B",
  command: "toolsremovebg2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsremovebg2",
  aliases: [],
  category: "restored",
  description: "Restored: tools-removebg2",
  usage: ".toolsremovebg2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
