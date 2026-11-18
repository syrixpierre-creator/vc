/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for couples-dp.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "couples-dp.js",
  family: "B",
  command: "couplesdp",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "couplesdp",
  aliases: [],
  category: "restored",
  description: "Restored: couples-dp",
  usage: ".couplesdp",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
