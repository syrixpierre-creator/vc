/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for jadian-putus.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "jadian-putus.js",
  family: "A",
  command: "jadianputus",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "jadianputus",
  aliases: [],
  category: "restored",
  description: "Restored: jadian-putus",
  usage: ".jadianputus",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
