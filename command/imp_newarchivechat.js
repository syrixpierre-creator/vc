/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_archivechat.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_archivechat.js",
  family: "A",
  command: "newarchivechat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newarchivechat",
  aliases: [],
  category: "restored",
  description: "Restored: new_archivechat",
  usage: ".newarchivechat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
