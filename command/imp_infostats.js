/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for info-stats.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "info-stats.js",
  family: "B",
  command: "infostats",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "infostats",
  aliases: [],
  category: "restored",
  description: "Restored: info-stats",
  usage: ".infostats",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
