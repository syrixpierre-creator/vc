/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-balas_img.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-balas_img.js",
  family: "B",
  command: "ownerbalasimg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerbalasimg",
  aliases: [],
  category: "restored",
  description: "Restored: owner-balas_img",
  usage: ".ownerbalasimg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
