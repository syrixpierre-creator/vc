/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-infoloker.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-infoloker.js",
  family: "A",
  command: "internetinfoloker",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetinfoloker",
  aliases: [],
  category: "restored",
  description: "Restored: internet-infoloker",
  usage: ".internetinfoloker",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
