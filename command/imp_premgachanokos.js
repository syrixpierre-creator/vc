/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for prem-gachanokos.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "prem-gachanokos.js",
  family: "B",
  command: "premgachanokos",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "premgachanokos",
  aliases: [],
  category: "restored",
  description: "Restored: prem-gachanokos",
  usage: ".premgachanokos",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
