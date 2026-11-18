/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for kickoffline.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "kickoffline.js",
  family: "B",
  command: "kickoffline",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "kickoffline",
  aliases: [],
  category: "restored",
  description: "Restored: kickoffline",
  usage: ".kickoffline",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
