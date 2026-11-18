/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for qc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "qc.js",
  family: "B",
  command: "xqc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xqc",
  aliases: [],
  category: "restored",
  description: "Restored: qc",
  usage: ".xqc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
