/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-doa.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-doa.js",
  family: "A",
  command: "internetdoa",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetdoa",
  aliases: [],
  category: "restored",
  description: "Restored: internet-doa",
  usage: ".internetdoa",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
