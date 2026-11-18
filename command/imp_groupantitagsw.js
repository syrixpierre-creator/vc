/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-antitagsw.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-antitagsw.js",
  family: "B",
  command: "groupantitagsw",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupantitagsw",
  aliases: [],
  category: "restored",
  description: "Restored: group-antitagsw",
  usage: ".groupantitagsw",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
