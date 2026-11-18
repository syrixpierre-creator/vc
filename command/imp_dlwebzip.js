/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for dl-webzip.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "dl-webzip.js",
  family: "B",
  command: "dlwebzip",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "dlwebzip",
  aliases: [],
  category: "restored",
  description: "Restored: dl-webzip",
  usage: ".dlwebzip",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
