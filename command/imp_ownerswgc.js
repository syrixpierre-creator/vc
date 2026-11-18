/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-swgc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-swgc.js",
  family: "B",
  command: "ownerswgc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerswgc",
  aliases: [],
  category: "restored",
  description: "Restored: owner-swgc",
  usage: ".ownerswgc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
