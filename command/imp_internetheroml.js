/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-heroml.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-heroml.js",
  family: "B",
  command: "internetheroml",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetheroml",
  aliases: [],
  category: "restored",
  description: "Restored: internet-heroml",
  usage: ".internetheroml",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
