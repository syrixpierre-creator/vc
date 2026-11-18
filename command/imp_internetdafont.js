/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-dafont.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-dafont.js",
  family: "A",
  command: "internetdafont",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetdafont",
  aliases: [],
  category: "restored",
  description: "Restored: internet-dafont",
  usage: ".internetdafont",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
