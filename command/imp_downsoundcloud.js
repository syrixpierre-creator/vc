/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for down-soundcloud.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "down-soundcloud.js",
  family: "B",
  command: "downsoundcloud",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downsoundcloud",
  aliases: [],
  category: "restored",
  description: "Restored: down-soundcloud",
  usage: ".downsoundcloud",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
