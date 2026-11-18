/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for kalkulator-mbg.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "kalkulator-mbg.js",
  family: "B",
  command: "xkalkulatormbg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xkalkulatormbg",
  aliases: [],
  category: "restored",
  description: "Restored: kalkulator-mbg",
  usage: ".xkalkulatormbg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
