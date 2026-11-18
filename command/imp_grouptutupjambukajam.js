/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-tutupjam-bukajam.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-tutupjam-bukajam.js",
  family: "B",
  command: "grouptutupjambukajam",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "grouptutupjambukajam",
  aliases: [],
  category: "restored",
  description: "Restored: group-tutupjam-bukajam",
  usage: ".grouptutupjambukajam",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
