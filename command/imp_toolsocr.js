/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-ocr.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-ocr.js",
  family: "A",
  command: "toolsocr",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsocr",
  aliases: [],
  category: "restored",
  description: "Restored: tools-ocr",
  usage: ".toolsocr",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
