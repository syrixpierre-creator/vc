/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-amdata.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-amdata.js",
  family: "A",
  command: "toolsamdata",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsamdata",
  aliases: [],
  category: "restored",
  description: "Restored: tools-amdata",
  usage: ".toolsamdata",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
