/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for checkerror.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "checkerror.js",
  family: "B",
  command: "xcheckerror",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xcheckerror",
  aliases: [],
  category: "restored",
  description: "Restored: checkerror",
  usage: ".xcheckerror",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
