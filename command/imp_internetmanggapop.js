/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-mangga-pop.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-mangga-pop.js",
  family: "A",
  command: "internetmanggapop",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetmanggapop",
  aliases: [],
  category: "restored",
  description: "Restored: internet-mangga-pop",
  usage: ".internetmanggapop",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
