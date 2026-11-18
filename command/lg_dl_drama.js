const { run } = require('../lib/compat');
const META = {"file":"dl-drama.js","family":"B","command":"drama","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "drama",
  aliases: ["kdrama","dramacool","dramadl","dramaep","dramaepisode","dramadown","ddl","ytvideo","yta","ytaudio","ytinfo","ytdetails"],
  category: "downloader",
  description: "Search Asian/Korean dramas and get episode info.",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
