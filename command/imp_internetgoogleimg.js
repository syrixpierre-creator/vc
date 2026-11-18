/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-google-img.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-google-img.js",
  family: "A",
  command: "internetgoogleimg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetgoogleimg",
  aliases: [],
  category: "restored",
  description: "Restored: internet-google-img",
  usage: ".internetgoogleimg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
