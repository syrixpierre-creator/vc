/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for img-blur.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "img-blur.js",
  family: "A",
  command: "imgblur",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "imgblur",
  aliases: [],
  category: "restored",
  description: "Restored: img-blur",
  usage: ".imgblur",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
