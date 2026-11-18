/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_medicine.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_medicine.js",
  family: "B",
  command: "newmedicine",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newmedicine",
  aliases: [],
  category: "restored",
  description: "Restored: new_medicine",
  usage: ".newmedicine",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
