/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for panel-deladmin.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "panel-deladmin.js",
  family: "B",
  command: "paneldeladmin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "paneldeladmin",
  aliases: [],
  category: "restored",
  description: "Restored: panel-deladmin",
  usage: ".paneldeladmin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
