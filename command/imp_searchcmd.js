/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for searchcmd.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "searchcmd.js",
  family: "A",
  command: "searchcmd",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "searchcmd",
  aliases: [],
  category: "restored",
  description: "Restored: searchcmd",
  usage: ".searchcmd",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
