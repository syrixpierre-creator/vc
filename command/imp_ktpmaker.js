/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ktpmaker.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ktpmaker.js",
  family: "A",
  command: "ktpmaker",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ktpmaker",
  aliases: [],
  category: "restored",
  description: "Restored: ktpmaker",
  usage: ".ktpmaker",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
