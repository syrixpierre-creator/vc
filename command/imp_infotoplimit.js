/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for info-toplimit.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "info-toplimit.js",
  family: "A",
  command: "infotoplimit",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "infotoplimit",
  aliases: [],
  category: "restored",
  description: "Restored: info-toplimit",
  usage: ".infotoplimit",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
