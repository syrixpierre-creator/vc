const { run } = require('../lib/compat');
const META = {
  file: "sticker-animebrat2.js",
  family: "A",
  command: "animebrat2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "animebrat2",
  aliases: [],
  category: "misc",
  description: "New plugin: animebrat2",
  usage: ".animebrat2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
