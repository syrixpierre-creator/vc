/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-groupsearch.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-groupsearch.js",
  family: "B",
  command: "internetgroupsearch",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetgroupsearch",
  aliases: [],
  category: "restored",
  description: "Restored: internet-groupsearch",
  usage: ".internetgroupsearch",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
