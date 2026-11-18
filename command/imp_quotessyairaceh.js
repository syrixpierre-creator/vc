/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for quotes-syairaceh.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "quotes-syairaceh.js",
  family: "A",
  command: "quotessyairaceh",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "quotessyairaceh",
  aliases: [],
  category: "restored",
  description: "Restored: quotes-syairaceh",
  usage: ".quotessyairaceh",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
