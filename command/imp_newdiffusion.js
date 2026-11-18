/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_diffusion.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_diffusion.js",
  family: "A",
  command: "newdiffusion",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newdiffusion",
  aliases: [],
  category: "restored",
  description: "Restored: new_diffusion",
  usage: ".newdiffusion",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
