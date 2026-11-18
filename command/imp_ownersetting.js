/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-setting.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-setting.js",
  family: "B",
  command: "ownersetting",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownersetting",
  aliases: [],
  category: "restored",
  description: "Restored: owner-setting",
  usage: ".ownersetting",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
