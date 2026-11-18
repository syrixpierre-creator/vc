/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for image-wallpaper.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "image-wallpaper.js",
  family: "B",
  command: "imagewallpaper",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "imagewallpaper",
  aliases: [],
  category: "restored",
  description: "Restored: image-wallpaper",
  usage: ".imagewallpaper",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
