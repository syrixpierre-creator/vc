/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for starmsg.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "starmsg.js",
  family: "B",
  command: "starmsg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "starmsg",
  aliases: [],
  category: "restored",
  description: "Restored: starmsg",
  usage: ".starmsg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
