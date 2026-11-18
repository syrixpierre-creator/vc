/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-benarkah.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-benarkah.js",
  family: "A",
  command: "funbenarkah",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funbenarkah",
  aliases: [],
  category: "restored",
  description: "Restored: fun-benarkah",
  usage: ".funbenarkah",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
