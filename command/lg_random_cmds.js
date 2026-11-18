const { run } = require('../lib/compat');
const META = {"file":"random-cmds.js","family":"B","command":"animevideo","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "animevideo",
  aliases: ["ranime","avideo","asupan","rasupan","girlvideo","gv","jokerimg","rjoker","jokerpic","rloli","lolipic","naruto","rnaruto","narutovid","sts","srilanka","slvideo","rst","demonslayer","rds","dsclip","dsvideo","onepiece","opvid","rop","onep","pakistani","sadshayari","sadsh","happyshayari","hsh","lovevideo","romantic","romanticvideo","abdullahzareem","zareem","tehzeebhafi","hafi","jaunelia","jonelia","elia","ahmedfaraz","faraz","faiz","faizahmedfaiz","wasif","wasifaliwasif","iqbal","allamaiqbal","parveenshakir","shakir","naqvi","mohsinnaqvi","amjad","amjadislamamjad","qateel","qateelshifai","javedakhtar","akhtar","attitude","attitudepk","attvid","meow","randomcat","vietnam","vietnamgirl","girlvietnam","randomvietnam","korea","koreagirl","girlkorea","randomkorea","japan","japangirl","girljapan","randomjapan","china","china-girl","girlchina","randomchina","indo","indogirl","girlindo","randomindo","thailand","thaigirl","girlthailand","randomthailand","image2","img2","images2","bday","fbday","morning"],
  category: "fun",
  description: "Send random anime video from Json-Data",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
