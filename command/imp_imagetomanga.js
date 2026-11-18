/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for image-tomanga.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "image-tomanga.js",
  family: "A",
  command: "imagetomanga",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "imagetomanga",
  aliases: [],
  category: "restored",
  description: "Restored: image-tomanga",
  usage: ".imagetomanga",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
