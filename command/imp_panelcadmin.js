/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for panel-cadmin.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "panel-cadmin.js",
  family: "B",
  command: "panelcadmin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "panelcadmin",
  aliases: [],
  category: "restored",
  description: "Restored: panel-cadmin",
  usage: ".panelcadmin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
