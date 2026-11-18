const { run } = require('../lib/compat');
const META = {"file":"dl-gdrive.js","family":"B","command":"gdrive","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "gdrive",
  aliases: ["gdrivedownload","gdownloader"],
  category: "downloader",
  description: "Download files from Google Drive.",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
