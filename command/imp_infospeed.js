/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for info-speed.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "info-speed.js",
  family: "B",
  command: "infospeed",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "infospeed",
  aliases: [],
  category: "restored",
  description: "Restored: info-speed",
  usage: ".infospeed",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
