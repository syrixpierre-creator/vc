/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-github-trend.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-github-trend.js",
  family: "A",
  command: "internetgithubtrend",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetgithubtrend",
  aliases: [],
  category: "restored",
  description: "Restored: internet-github-trend",
  usage: ".internetgithubtrend",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
