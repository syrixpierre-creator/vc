/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-kompas.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-kompas.js",
  family: "A",
  command: "internetkompas",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetkompas",
  aliases: [],
  category: "restored",
  description: "Restored: internet-kompas",
  usage: ".internetkompas",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
