/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for cek-warn.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "cek-warn.js",
  family: "A",
  command: "xcekwarn",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xcekwarn",
  aliases: [],
  category: "restored",
  description: "Restored: cek-warn",
  usage: ".xcekwarn",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
