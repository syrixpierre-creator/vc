const { run } = require('../lib/compat');
const META = {
  file: "owner-tagsw.js",
  family: "A",
  command: "upswimage",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "upswimage",
  aliases: ["upswvideo", "upswtext", "upswaudio", "upsw"],
  category: "misc",
  description: "New plugin: upswimage",
  usage: ".upswimage",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
