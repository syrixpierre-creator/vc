/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_statusprivacy.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_statusprivacy.js",
  family: "A",
  command: "newstatusprivacy",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newstatusprivacy",
  aliases: [],
  category: "restored",
  description: "Restored: new_statusprivacy",
  usage: ".newstatusprivacy",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
