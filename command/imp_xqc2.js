/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for qc2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "qc2.js",
  family: "B",
  command: "xqc2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xqc2",
  aliases: [],
  category: "restored",
  description: "Restored: qc2",
  usage: ".xqc2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
