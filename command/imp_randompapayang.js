/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for random-papayang.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "random-papayang.js",
  family: "A",
  command: "randompapayang",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "randompapayang",
  aliases: [],
  category: "restored",
  description: "Restored: random-papayang",
  usage: ".randompapayang",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
