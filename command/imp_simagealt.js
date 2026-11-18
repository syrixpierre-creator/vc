/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for simage-alt.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "simage-alt.js",
  family: "B",
  command: "simagealt",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "simagealt",
  aliases: [],
  category: "restored",
  description: "Restored: simage-alt",
  usage: ".simagealt",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
