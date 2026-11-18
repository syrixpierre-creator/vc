/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for vcf.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "vcf.js",
  family: "B",
  command: "vcf",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "vcf",
  aliases: [],
  category: "restored",
  description: "Restored: vcf",
  usage: ".vcf",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
