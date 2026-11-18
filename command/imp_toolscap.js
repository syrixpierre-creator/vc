/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-cap.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-cap.js",
  family: "A",
  command: "toolscap",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolscap",
  aliases: [],
  category: "restored",
  description: "Restored: tools-cap",
  usage: ".toolscap",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
