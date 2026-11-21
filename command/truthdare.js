/**
 * QUEEN AKUMA — Truth or Dare (Hinglish questions from gist)
 */
const truths = [
  "Who is the most annoying person in your group?",
  "Kabhi kisi group member ko crush ki tarah dekha?",
  "Do you remember your most embarrassing WhatsApp status?",
  "Kis group member ke saath dinner jaana chahega?",
  "Have you ever exposed someone secret by accident?",
  "Who is the funniest person in the group?",
  "Which chat do you screenshot the most?",
  "When did you last leave someone on seen?",
  "Who gossips the most in the group?",
  "What is the name of the most embarrassing chat on your phone?",
  "Kisi ko kabhi wrong emoji bheja? Kya tha?",
  "Kis group member ki baat kabhi ignore ki ho?",
  "Which group admin did you ever want to remove?",
  "What irritates you the most?",
  "Which member is closest to you outside the group?",
  "Kaun sa message tera sabse zyada regret hai bhejna?",
  "Kabhi kisi ka DP zoom karke dekha?",
  "Group ka kaunsa game sabse zyada boring laga?",
  "Who do you fight with the most in the group?",
  "Have you ever blocked someone?",
  "What are your last 3 emojis? Tell us.",
  "Kaun sa group member tujhe secretly pasand hai?",
  "Kis chat mein kabhi galat photo ya message bheja?",
  "What is your biggest WhatsApp addiction?",
  "Which group member has the best Insta profile?",
  "Kisi ka DP kabhi fake laga ho toh kaunsa?",
  "Who replies the latest in the group?",
  "Whose voice notes are the weirdest in the group?",
  "Tujhe kaunsa WhatsApp feature sabse zyada pasand hai?",
  "Have you ever secretly muted someone?"
];

const dares = [
  "Send your last 3 emojis in the group.",
  "Send I love you to a random member (show the screenshot).",
  "Send your most used sticker.",
  "Talk with CAPS LOCK on for 1 minute in the group.",
  "Apni DP change karke 10 minute rakho (phir wapas).",
  "Message an admin and call them Boss.",
  "Send your weirdest voice note.",
  "Put I am crazy as your status for 5 minutes.",
  "Kisi member ka naam leke funny compliment do.",
  "Send a random (safe) photo from your gallery."
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
