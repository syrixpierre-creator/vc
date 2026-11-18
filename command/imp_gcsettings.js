/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for gcsettings.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "gcsettings.js",
  family: "B",
  command: "gcsettings",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gcsettings",
  aliases: [],
  category: "restored",
  description: "Restored: gcsettings",
  usage: ".gcsettings",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
