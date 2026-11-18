/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for panel-listpanel.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "panel-listpanel.js",
  family: "B",
  command: "panellistpanel",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "panellistpanel",
  aliases: [],
  category: "restored",
  description: "Restored: panel-listpanel",
  usage: ".panellistpanel",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
