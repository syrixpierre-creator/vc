/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for quotes-sunda.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "quotes-sunda.js",
  family: "A",
  command: "quotessunda",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "quotessunda",
  aliases: [],
  category: "restored",
  description: "Restored: quotes-sunda",
  usage: ".quotessunda",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
