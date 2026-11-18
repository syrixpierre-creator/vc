/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for down-gdrive.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "down-gdrive.js",
  family: "B",
  command: "downgdrive",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downgdrive",
  aliases: [],
  category: "restored",
  description: "Restored: down-gdrive",
  usage: ".downgdrive",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
