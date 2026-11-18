/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-exec2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-exec2.js",
  family: "B",
  command: "ownerexec2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerexec2",
  aliases: [],
  category: "restored",
  description: "Restored: owner-exec2",
  usage: ".ownerexec2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
