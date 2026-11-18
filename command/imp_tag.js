/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tag.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tag.js",
  family: "A",
  command: 'tagx',
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "tagalt",
  aliases: [],
  category: "restored",
  description: "Restored: tag",
  usage: ".tag",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
