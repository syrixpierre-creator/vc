/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_apkdl.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_apkdl.js",
  family: "B",
  command: "newapkdl",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newapkdl",
  aliases: [],
  category: "restored",
  description: "Restored: new_apkdl",
  usage: ".newapkdl",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
