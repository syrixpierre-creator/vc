/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for _autogempa.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "_autogempa.js",
  family: "B",
  command: "autogempa",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "autogempa",
  aliases: [],
  category: "restored",
  description: "Restored: _autogempa",
  usage: ".autogempa",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
