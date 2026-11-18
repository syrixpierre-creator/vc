/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for cekswgc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "cekswgc.js",
  family: "A",
  command: "xcekswgc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xcekswgc",
  aliases: [],
  category: "restored",
  description: "Restored: cekswgc",
  usage: ".xcekswgc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
