/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-ekspedisilist.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-ekspedisilist.js",
  family: "A",
  command: "toolsekspedisilist",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsekspedisilist",
  aliases: [],
  category: "restored",
  description: "Restored: tools-ekspedisilist",
  usage: ".toolsekspedisilist",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
