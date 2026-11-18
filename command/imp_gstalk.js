/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for gstalk.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "gstalk.js",
  family: "A",
  command: "gstalk",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gstalk",
  aliases: [],
  category: "restored",
  description: "Restored: gstalk",
  usage: ".gstalk",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
