const { run } = require('../lib/compat');
const META = {"file":"upscale-cmds.js","family":"B","command":"upscale1","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "upscale1",
  aliases: ["hd1","upscale2","upscale3","hd3","upscale4","upscale5","hd5","upscale6","hd6","upscale7","hd7","upscale8","hd8","upscale9","hd9","upscale10","hd10","upscale11","hd11","upscale12","hd12","upscale13","hd13","upscale14","hd14","upscale15","hd15","upscale16","hd16","deblur","blurface","nobg1","rmbg1","nobg","nobg2","rmbg2","hdremini","enhancehd","enhance1","enh1","enhance4","enh4","enhance8","enh8","enhance16","enh16","colorize","addcolor","colour"],
  category: "tools",
  description: "Upscale image with resolution 1",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
