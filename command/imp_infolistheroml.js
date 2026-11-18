/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for info-listheroml.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "info-listheroml.js",
  family: "B",
  command: "infolistheroml",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "infolistheroml",
  aliases: [],
  category: "restored",
  description: "Restored: info-listheroml",
  usage: ".infolistheroml",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
