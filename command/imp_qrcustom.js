/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for qrcustom.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "qrcustom.js",
  family: "A",
  command: "qrcustom",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "qrcustom",
  aliases: [],
  category: "restored",
  description: "Restored: qrcustom",
  usage: ".qrcustom",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
