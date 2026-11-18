/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for random-pap.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "random-pap.js",
  family: "A",
  command: "randompap",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "randompap",
  aliases: [],
  category: "restored",
  description: "Restored: random-pap",
  usage: ".randompap",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
