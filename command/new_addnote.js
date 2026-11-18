const { run } = require('../lib/compat');
const META = {
  file: "notes.js",
  family: "B",
  command: "addnote",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "addnote",
  aliases: ["getnote", "getnotes", "updatenote", "delnote", "delallnotes"],
  category: "misc",
  description: "New plugin: addnote",
  usage: ".addnote",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
