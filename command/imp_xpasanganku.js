/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for pasanganku.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "pasanganku.js",
  family: "A",
  command: "xpasanganku",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xpasanganku",
  aliases: [],
  category: "restored",
  description: "Restored: pasanganku",
  usage: ".xpasanganku",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
