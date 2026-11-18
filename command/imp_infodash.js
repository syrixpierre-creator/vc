/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for info-dash.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "info-dash.js",
  family: "B",
  command: "infodash",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "infodash",
  aliases: [],
  category: "restored",
  description: "Restored: info-dash",
  usage: ".infodash",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
