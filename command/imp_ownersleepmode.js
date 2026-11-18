/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-sleepmode.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-sleepmode.js",
  family: "B",
  command: "ownersleepmode",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownersleepmode",
  aliases: [],
  category: "restored",
  description: "Restored: owner-sleepmode",
  usage: ".ownersleepmode",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
