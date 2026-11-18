/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for Prem-amverify.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "Prem-amverify.js",
  family: "B",
  command: "premamverify",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "premamverify",
  aliases: [],
  category: "restored",
  description: "Restored: Prem-amverify",
  usage: ".premamverify",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
