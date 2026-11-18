/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for heroku-del.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "heroku-del.js",
  family: "B",
  command: "xherokudel",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xherokudel",
  aliases: [],
  category: "restored",
  description: "Restored: heroku-del",
  usage: ".xherokudel",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
