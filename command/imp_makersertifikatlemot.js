/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-sertifikatlemot.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-sertifikatlemot.js",
  family: "B",
  command: "makersertifikatlemot",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makersertifikatlemot",
  aliases: [],
  category: "restored",
  description: "Restored: maker-sertifikatlemot",
  usage: ".makersertifikatlemot",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
