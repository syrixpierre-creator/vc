/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_invitelink.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_invitelink.js",
  family: "A",
  command: "newinvitelink",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newinvitelink",
  aliases: [],
  category: "restored",
  description: "Restored: new_invitelink",
  usage: ".newinvitelink",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
