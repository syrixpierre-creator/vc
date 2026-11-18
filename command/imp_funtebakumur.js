/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-tebakumur.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-tebakumur.js",
  family: "A",
  command: "funtebakumur",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funtebakumur",
  aliases: [],
  category: "restored",
  description: "Restored: fun-tebakumur",
  usage: ".funtebakumur",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
