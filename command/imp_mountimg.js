/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for mountImg.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "mountImg.js",
  family: "A",
  command: "mountimg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "mountimg",
  aliases: [],
  category: "restored",
  description: "Restored: mountImg",
  usage: ".mountimg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
