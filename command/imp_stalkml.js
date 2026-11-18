/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for stalk-ml.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "stalk-ml.js",
  family: "A",
  command: "stalkml",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stalkml",
  aliases: [],
  category: "restored",
  description: "Restored: stalk-ml",
  usage: ".stalkml",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
