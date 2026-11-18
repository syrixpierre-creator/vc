/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_calc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_calc.js",
  family: "B",
  command: "newcalc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newcalc",
  aliases: [],
  category: "restored",
  description: "Restored: new_calc",
  usage: ".newcalc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
