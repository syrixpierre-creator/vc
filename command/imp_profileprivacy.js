/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for profileprivacy.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "profileprivacy.js",
  family: "B",
  command: "profileprivacy",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "profileprivacy",
  aliases: [],
  category: "restored",
  description: "Restored: profileprivacy",
  usage: ".profileprivacy",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
