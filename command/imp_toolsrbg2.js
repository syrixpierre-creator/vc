/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-rbg2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-rbg2.js",
  family: "B",
  command: "toolsrbg2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsrbg2",
  aliases: [],
  category: "restored",
  description: "Restored: tools-rbg2",
  usage: ".toolsrbg2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
