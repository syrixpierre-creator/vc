/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_wordcloud.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_wordcloud.js",
  family: "B",
  command: "newwordcloud",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newwordcloud",
  aliases: [],
  category: "restored",
  description: "Restored: new_wordcloud",
  usage: ".newwordcloud",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
