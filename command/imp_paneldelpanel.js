/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for panel-delpanel.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "panel-delpanel.js",
  family: "B",
  command: "paneldelpanel",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "paneldelpanel",
  aliases: [],
  category: "restored",
  description: "Restored: panel-delpanel",
  usage: ".paneldelpanel",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
