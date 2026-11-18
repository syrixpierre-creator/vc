/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for dl-mfire.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "dl-mfire.js",
  family: "B",
  command: "dlmfire",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "dlmfire",
  aliases: [],
  category: "restored",
  description: "Restored: dl-mfire",
  usage: ".dlmfire",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
