/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-delprem.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-delprem.js",
  family: "B",
  command: "ownerdelprem",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerdelprem",
  aliases: [],
  category: "restored",
  description: "Restored: owner-delprem",
  usage: ".ownerdelprem",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
