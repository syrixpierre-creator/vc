/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for stalk-ig.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "stalk-ig.js",
  family: "B",
  command: "stalkig",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stalkig",
  aliases: [],
  category: "restored",
  description: "Restored: stalk-ig",
  usage: ".stalkig",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
