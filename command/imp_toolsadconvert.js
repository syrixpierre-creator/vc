/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-adconvert.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-adconvert.js",
  family: "B",
  command: "toolsadconvert",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsadconvert",
  aliases: [],
  category: "restored",
  description: "Restored: tools-adconvert",
  usage: ".toolsadconvert",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
