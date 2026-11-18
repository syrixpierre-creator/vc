/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-jadwalbukatutup.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-jadwalbukatutup.js",
  family: "B",
  command: "groupjadwalbukatutup",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupjadwalbukatutup",
  aliases: [],
  category: "restored",
  description: "Restored: group-jadwalbukatutup",
  usage: ".groupjadwalbukatutup",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
