const { run } = require('../lib/compat');
const META = {"file":"funcek.js","family":"A","command":"goblokcek","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "goblokcek",
  aliases: ["jelekcek","gaycek","rate","lesbicek","begocek","suhucek","pintercek","jagocek","nolepcek","babicek","bebancek","baikcek","jahatcek","anjingcek","haramcek","pakboycek","pakgirlcek","sangecek","bapercek","fakboycek","alimcek","fakgirlcek","kerencek","wibucek","pasarkascek","kulcek","cekgoblok","cekjelek","cekgay","ceklesbi","cekbego","ceksuhu","cekpinter","cekjago","ceknolep","cekbabi","cekbeban","cekbaik","cekjahat","cekanjing","cekharam","cekpakboy","cekpakgirl","ceksange","cekbaper","cekfakboy","cekalim","cekfakgirl","cekkeren","cekwibu","cekpasarkas","cekkul"],
  category: "fun",
  description: "Imported tool",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
