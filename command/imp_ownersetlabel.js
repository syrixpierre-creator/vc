/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-setlabel.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-setlabel.js",
  family: "B",
  command: "ownersetlabel",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownersetlabel",
  aliases: [],
  category: "restored",
  description: "Restored: owner-setlabel",
  usage: ".ownersetlabel",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
