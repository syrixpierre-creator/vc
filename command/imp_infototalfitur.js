/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for info-totalfitur.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "info-totalfitur.js",
  family: "B",
  command: "infototalfitur",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "infototalfitur",
  aliases: [],
  category: "restored",
  description: "Restored: info-totalfitur",
  usage: ".infototalfitur",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
