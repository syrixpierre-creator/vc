/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for snackvideo.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "snackvideo.js",
  family: "A",
  command: "snackvideo",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "snackvideo",
  aliases: [],
  category: "restored",
  description: "Restored: snackvideo",
  usage: ".snackvideo",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
