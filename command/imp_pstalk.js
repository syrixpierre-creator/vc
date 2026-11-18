/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for pstalk.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "pstalk.js",
  family: "A",
  command: "pstalk",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "pstalk",
  aliases: [],
  category: "restored",
  description: "Restored: pstalk",
  usage: ".pstalk",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
