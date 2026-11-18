const { run } = require('../lib/compat');
const META = {
  file: "anime-storywa.js",
  family: "A",
  command: "storyanime",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "storyanime",
  aliases: [],
  category: "misc",
  description: "New plugin: storyanime",
  usage: ".storyanime",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
