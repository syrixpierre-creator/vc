/**
 * QUEEN AKUMA — Truth or Dare (Hinglish questions from gist)
 */
const truths = [
  "Tere group mein sabse zyada annoying kaun hai?",
  "Kabhi kisi group member ko crush ki tarah dekha?",
  "Apna sabse embarrassing WhatsApp status yaad hai?",
  "Kis group member ke saath dinner jaana chahega?",
  "Kisi ka secret kabhi accidentally expose kiya?",
  "Group mein kaun sabse funny lagta hai?",
  "Tera sabse zyada screenshot kis chat ka hai?",
  "Last time kab kisi ko seen maar ke reply nahi kiya?",
  "Kaun sabse zyada gossip karta hai group mein?",
  "Apne phone ka sabse embarrassing chat ka naam kya hai?",
  "Kisi ko kabhi wrong emoji bheja? Kya tha?",
  "Kis group member ki baat kabhi ignore ki ho?",
  "Kis group admin ko kabhi nikaalne ka man kiya ho?",
  "Tujhe kis cheez se sabse zyada irritation hoti hai?",
  "Group ke bahar kaunsa member tere closest hai?",
  "Kaun sa message tera sabse zyada regret hai bhejna?",
  "Kabhi kisi ka DP zoom karke dekha?",
  "Group ka kaunsa game sabse zyada boring laga?",
  "Kis se sabse zyada fights hoti hai group mein?",
  "Kisi ko kabhi block kiya?",
  "Tere last 3 emojis kya hain? Batao.",
  "Kaun sa group member tujhe secretly pasand hai?",
  "Kis chat mein kabhi galat photo ya message bheja?",
  "Tera sabse bada WhatsApp addiction kya hai?",
  "Kis group member ki Insta profile tujhe zyada acchi lagti hai?",
  "Kisi ka DP kabhi fake laga ho toh kaunsa?",
  "Kaun group mein sabse zyada late reply karta hai?",
  "Group mein kiski voice note sabse zyada weird hoti hai?",
  "Tujhe kaunsa WhatsApp feature sabse zyada pasand hai?",
  "Kabhi kisi ko secretly mute kiya ho?"
];

const dares = [
  "Group me apni last 3 emojis bhejo.",
  "Kisi random member ko 'I love you' text bhejo (screenshot do).",
  "Apni most used sticker bhejo.",
  "Group me 1 minute ke liye CAPS LOCK on karke baat karo.",
  "Apni DP change karke 10 minute rakho (phir wapas).",
  "Kisi admin ko 'Boss' bolke message karo.",
  "Apna weirdest voice note bhejo.",
  "Group me 'Main pagal hoon' status daal do 5 minute ke liye.",
  "Kisi member ka naam leke funny compliment do.",
  "Apni gallery se random photo bhejo (safe wali)."
];

module.exports = {
  command: 'truth',
  aliases: ['dare', 'tod', 'truthordare'],
  category: 'fun',
  description: 'Truth or Dare (Hinglish)',
  usage: '.truth  |  .dare  |  .tod',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const cmd = (message.body || '').toLowerCase().split(/\s+/)[0].replace(/^[.!#]/, '');
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });

    if (cmd === 'dare' || (cmd === 'tod' && Math.random() > 0.5)) {
      const d = dares[Math.floor(Math.random() * dares.length)];
      return reply(`🔥 *DARE*\n\n${d}`);
    }
    const t = truths[Math.floor(Math.random() * truths.length)];
    return reply(`🎭 *TRUTH*\n\n${t}`);
  }
};
