/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for statusprivacy.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "statusprivacy.js",
  family: "B",
  command: "statusprivacy",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "statusprivacy",
  aliases: [],
  category: "restored",
  description: "Restored: statusprivacy",
  usage: ".statusprivacy",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
