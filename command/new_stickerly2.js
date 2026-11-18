const { run } = require('../lib/compat');
const META = {
  file: "stickerly2.js",
  family: "A",
  command: "stickerly2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "stickerly2",
  aliases: ["stikerly2"],
  category: "misc",
  description: "New plugin: stickerly2",
  usage: ".stickerly2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
