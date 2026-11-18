/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for panel-listadmin.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "panel-listadmin.js",
  family: "B",
  command: "panellistadmin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "panellistadmin",
  aliases: [],
  category: "restored",
  description: "Restored: panel-listadmin",
  usage: ".panellistadmin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
