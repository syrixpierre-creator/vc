/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-antitagsw.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-antitagsw.js",
  family: "B",
  command: "toolsantitagsw",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsantitagsw",
  aliases: [],
  category: "restored",
  description: "Restored: tools-antitagsw",
  usage: ".toolsantitagsw",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
