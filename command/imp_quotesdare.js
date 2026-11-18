/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for quotes-dare.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "quotes-dare.js",
  family: "B",
  command: "quotesdare",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "quotesdare",
  aliases: [],
  category: "restored",
  description: "Restored: quotes-dare",
  usage: ".quotesdare",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
