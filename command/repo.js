const { sam } = require("../sam");

sam({
    pattern: "github",
    alias: ["repo", "git", "source", "account", "gh"],
    desc: "Show owner GitHub account",
    category: "general",
    react: "🌟",
    filename: __filename
}, async (malvin, mek, m, { from, reply }) => {
    await reply('https://github.com/INCONNU-BOY-SENSEI');
});
