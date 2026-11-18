/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-wikipedia.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-wikipedia.js",
  family: "A",
  command: "internetwikipedia",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetwikipedia",
  aliases: [],
  category: "restored",
  description: "Restored: internet-wikipedia",
  usage: ".internetwikipedia",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
