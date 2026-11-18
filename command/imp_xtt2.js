/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tt2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tt2.js",
  family: "B",
  command: "xtt2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xtt2",
  aliases: [],
  category: "restored",
  description: "Restored: tt2",
  usage: ".xtt2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
