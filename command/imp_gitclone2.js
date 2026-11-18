/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for gitclone2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "gitclone2.js",
  family: "A",
  command: "gitclone2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gitclone2",
  aliases: [],
  category: "restored",
  description: "Restored: gitclone2",
  usage: ".gitclone2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
