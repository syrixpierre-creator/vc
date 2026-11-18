/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for info-listprem.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "info-listprem.js",
  family: "B",
  command: "infolistprem",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "infolistprem",
  aliases: [],
  category: "restored",
  description: "Restored: info-listprem",
  usage: ".infolistprem",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
