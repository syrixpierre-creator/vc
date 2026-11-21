/* QUEEN AKUMA legacy plugin (family B) — converted automatically */
const { cmd } = require('../lib/compat').registrar;

cmd({
    pattern: "sy",
    alias: ["se", "ss", "flirt"],
    desc: "Hidden fun lines",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, userConfig }) => {
    try {
        const botConfig = userConfig;

        const lines = [
            "🥰 For one smile of yours I would give my whole day 💖\nWhen you laugh, it feels like the morning ✨🌸",

            "😍 Oh, your eyes 👀💘\nMy heart says I could look at you forever and forget the world 🌍❤️",

            "🌹 You are so lovely that even the moon gets shy 🌙🙈\nThere is nobody like you in the whole world 💞",

            "💌 When you are near, time stops ⏰💖\nI wish this moment would last forever 🥺👩‍❤️‍👨",

            "😜 Hey listen 🫣\nYour smile has a faster network than 5G 📶😂💓\nIt connects straight to the heart!",

            "✨ Seeing you feels like a dream came true 💭❤️\nYou are the most beautiful wish of my life 🥰🌸",

            "🔥 Oh, your style 😏💘\nOne look and my heart said: you are the one I was looking for 🫶",

            "💖 The group feels empty without you 🥺\nWhen you come, everything lights up 🎉😍✨",

            "🌈 Your words are magic ✨🪄\nHearing you makes the whole day good, you are the best 💝😘",

            "🫣 Hayee itni cuteness kahan se laati ho? 🥰🍫\nTum to chocolate se bhi zyada meethi ho 😋💕",

            "💞 My heart remembered you again today 💌\nJust thinking of you makes me smile 😊🌹",

            "🌸 You are more beautiful than flowers 💐💖\nSeeing you makes my heart bloom 🌷😍"
        ];

        const random = lines[Math.floor(Math.random() * lines.length)];
        await conn.sendMessage(from, { react: { text: "🥰", key: m.key } });

        await reply(`*💘 CUTE LINE FOR YOU 💘*\n\n${random}\n\n*${botConfig.CAPTION || "Powered by QUEEN AKUMA"}*`);
    } catch (e) {
        reply("❌ Error!");
    }
});
