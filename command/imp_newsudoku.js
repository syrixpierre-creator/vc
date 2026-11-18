/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_sudoku.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_sudoku.js",
  family: "B",
  command: "newsudoku",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newsudoku",
  aliases: [],
  category: "restored",
  description: "Restored: new_sudoku",
  usage: ".newsudoku",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
