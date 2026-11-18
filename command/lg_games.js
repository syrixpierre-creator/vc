const { run } = require('../lib/compat');
const META = {"file":"games.js","family":"B","command":"games","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "games2",
  aliases: ["playgame","playgames","gamelist","tttstart","tttend","endttt","tttcancel","ttstop","tictactoestop","tictactoeend","stopttt","cancelttt","tttjoin","jointtt","tttboard","board","tttshow","wcg","wordchain","wcgstart","wordgame","wcgjoin","joinwcg","joinwordchain","wcgbegin","startwcg","wcggo","wcgend","endwcg","wcgstop","stopwcg","wcgcancel","wcgscores","wcgscore","wordchainscore","word","wcgword","say","dicestart","dicegame","rolldice","dicejoin","joindice","roll","diceroll","throwdice","diceend","enddice","dicestop","stopdice","dicecancel","tttai","tttbot","tictactoeai","aitt","wcgai","wcgbot","wordchainai","aiwcg","diceai","dicebot","aidice","rolldiceai"],
  category: "game",
  description: "Show all available games and commands",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
