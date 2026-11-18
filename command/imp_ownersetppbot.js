/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-setppbot.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-setppbot.js",
  family: "B",
  command: "ownersetppbot",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownersetppbot",
  aliases: [],
  category: "restored",
  description: "Restored: owner-setppbot",
  usage: ".ownersetppbot",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
