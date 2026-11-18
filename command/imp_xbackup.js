/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for backup.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "backup.js",
  family: "B",
  command: "xbackup",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xbackup",
  aliases: [],
  category: "restored",
  description: "Restored: backup",
  usage: ".xbackup",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
