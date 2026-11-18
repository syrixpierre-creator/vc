/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_addtogroup.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_addtogroup.js",
  family: "A",
  command: "newaddtogroup",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newaddtogroup",
  aliases: [],
  category: "restored",
  description: "Restored: new_addtogroup",
  usage: ".newaddtogroup",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
