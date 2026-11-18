/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-editfoto.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-editfoto.js",
  family: "A",
  command: "aieditfoto",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aieditfoto",
  aliases: [],
  category: "restored",
  description: "Restored: ai-editfoto",
  usage: ".aieditfoto",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
