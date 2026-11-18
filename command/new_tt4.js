const { run } = require('../lib/compat');
const META = {
  file: "tt4.js",
  family: "A",
  command: "tt4",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "tt4",
  aliases: ["ttdl4", "tiktok4"],
  category: "misc",
  description: "New plugin: tt4",
  usage: ".tt4",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
