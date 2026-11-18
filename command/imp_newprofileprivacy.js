/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_profileprivacy.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_profileprivacy.js",
  family: "A",
  command: "newprofileprivacy",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newprofileprivacy",
  aliases: [],
  category: "restored",
  description: "Restored: new_profileprivacy",
  usage: ".newprofileprivacy",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
