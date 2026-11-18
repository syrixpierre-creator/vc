/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-8upload.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-8upload.js",
  family: "B",
  command: "tools8upload",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "tools8upload",
  aliases: [],
  category: "restored",
  description: "Restored: tools-8upload",
  usage: ".tools8upload",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
