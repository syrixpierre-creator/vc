/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-exec.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-exec.js",
  family: "B",
  command: "ownerexec",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerexec",
  aliases: [],
  category: "restored",
  description: "Restored: owner-exec",
  usage: ".ownerexec",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
