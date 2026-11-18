/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for anti-porn.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "anti-porn.js",
  family: "B",
  command: "xantiporn",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xantiporn",
  aliases: [],
  category: "restored",
  description: "Restored: anti-porn",
  usage: ".xantiporn",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
