/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for u-aupload.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "u-aupload.js",
  family: "B",
  command: "uaupload",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "uaupload",
  aliases: [],
  category: "restored",
  description: "Restored: u-aupload",
  usage: ".uaupload",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
