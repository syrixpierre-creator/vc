/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for upload.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "upload.js",
  family: "B",
  command: "upload",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "upload",
  aliases: [],
  category: "restored",
  description: "Restored: upload",
  usage: ".upload",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
