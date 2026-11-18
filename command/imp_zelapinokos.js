/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for zelapi-nokos.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "zelapi-nokos.js",
  family: "B",
  command: "zelapinokos",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "zelapinokos",
  aliases: [],
  category: "restored",
  description: "Restored: zelapi-nokos",
  usage: ".zelapinokos",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
