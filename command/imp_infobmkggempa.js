/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for info-bmkggempa.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "info-bmkggempa.js",
  family: "A",
  command: "infobmkggempa",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "infobmkggempa",
  aliases: [],
  category: "restored",
  description: "Restored: info-bmkggempa",
  usage: ".infobmkggempa",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
