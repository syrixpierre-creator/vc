/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-ssweb.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-ssweb.js",
  family: "B",
  command: "internetssweb",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetssweb",
  aliases: [],
  category: "restored",
  description: "Restored: internet-ssweb",
  usage: ".internetssweb",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
