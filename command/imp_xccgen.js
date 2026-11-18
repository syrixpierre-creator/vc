/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ccgen.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ccgen.js",
  family: "A",
  command: "xccgen",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xccgen",
  aliases: [],
  category: "restored",
  description: "Restored: ccgen",
  usage: ".xccgen",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
