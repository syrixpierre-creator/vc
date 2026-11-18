/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for panel-cpanel.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "panel-cpanel.js",
  family: "B",
  command: "panelcpanel",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "panelcpanel",
  aliases: [],
  category: "restored",
  description: "Restored: panel-cpanel",
  usage: ".panelcpanel",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
