/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for imagen-flux.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "imagen-flux.js",
  family: "B",
  command: "imagenflux",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "imagenflux",
  aliases: [],
  category: "restored",
  description: "Restored: imagen-flux",
  usage: ".imagenflux",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
