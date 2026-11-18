/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-diffusion.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-diffusion.js",
  family: "B",
  command: "aidiffusion",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aidiffusion",
  aliases: [],
  category: "restored",
  description: "Restored: ai-diffusion",
  usage: ".aidiffusion",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
