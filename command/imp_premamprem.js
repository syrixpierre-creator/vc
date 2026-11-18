/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for prem-amprem.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "prem-amprem.js",
  family: "B",
  command: "premamprem",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "premamprem",
  aliases: [],
  category: "restored",
  description: "Restored: prem-amprem",
  usage: ".premamprem",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
