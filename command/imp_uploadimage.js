/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for uploadImage.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "uploadImage.js",
  family: "B",
  command: "uploadimage",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "uploadimage",
  aliases: [],
  category: "restored",
  description: "Restored: uploadImage",
  usage: ".uploadimage",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
