/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-sertifikatcinta.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-sertifikatcinta.js",
  family: "B",
  command: "makersertifikatcinta",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makersertifikatcinta",
  aliases: [],
  category: "restored",
  description: "Restored: maker-sertifikatcinta",
  usage: ".makersertifikatcinta",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
