/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for imagine-diffusion.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "imagine-diffusion.js",
  family: "B",
  command: "imaginediffusion",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "imaginediffusion",
  aliases: [],
  category: "restored",
  description: "Restored: imagine-diffusion",
  usage: ".imaginediffusion",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
