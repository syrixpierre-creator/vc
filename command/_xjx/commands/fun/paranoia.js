const axios = require('axios');
module.exports = {
  'name': 'paranoia',
  'aliases': [],
  'category': "fun",
  'description': "Get a random paranoia question",
  'usage': ".paranoia",
  async 'execute'(v1, v2, v3, v4) {
    await v4.react('😱');
    try {
      const {
        data: v5
      } = await axios.get('https://api.truthordarebot.xyz/v1/paranoia');
      const v6 = v5.question || v5.result || JSON.stringify(v5);
      await v4.reply("😱 *Paranoia*\n\n_" + v6 + '_');
    } catch (v7) {
      await v4.reply("❌ Error: " + v7.message);
    }
  }
};
