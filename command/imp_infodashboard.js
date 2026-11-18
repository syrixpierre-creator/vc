/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for info-dashboard.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "info-dashboard.js",
  family: "B",
  command: "infodashboard",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "infodashboard",
  aliases: [],
  category: "restored",
  description: "Restored: info-dashboard",
  usage: ".infodashboard",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
