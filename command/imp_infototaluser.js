/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for info-totaluser.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "info-totaluser.js",
  family: "A",
  command: "infototaluser",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "infototaluser",
  aliases: [],
  category: "restored",
  description: "Restored: info-totaluser",
  usage: ".infototaluser",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
