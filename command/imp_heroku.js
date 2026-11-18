/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for heroku.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "heroku.js",
  family: "B",
  command: "heroku",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "heroku",
  aliases: [],
  category: "restored",
  description: "Restored: heroku",
  usage: ".heroku",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
