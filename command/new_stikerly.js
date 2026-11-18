const { run } = require('../lib/compat');
const META = {
  file: "stickerly.js",
  family: "A",
  command: "stikerly",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "stikerly",
  aliases: [],
  category: "misc",
  description: "New plugin: stikerly",
  usage: ".stikerly",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
