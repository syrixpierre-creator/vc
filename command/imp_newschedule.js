/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_schedule.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_schedule.js",
  family: "B",
  command: "newschedule",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newschedule",
  aliases: [],
  category: "restored",
  description: "Restored: new_schedule",
  usage: ".newschedule",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
