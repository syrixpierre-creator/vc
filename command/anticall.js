const store = require('../lib/lightweight_store');
const fs = require('fs');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

const ANTICALL_PATH = './data/anticall.json';

async function readState() {
  try {
    if (HAS_DB) {
      const settings = await store.getSetting('global', 'anticall');
      return settings || { enabled: false };
    } else {
      if (!fs.existsSync(ANTICALL_PATH)) return { enabled: false };
      const raw = fs.readFileSync(ANTICALL_PATH, 'utf8');
      const data = JSON.parse(raw || '{}');
      return { enabled: !!data.enabled };
    }
  } catch {
    return { enabled: false };
  }
}

async function writeState(enabled) {
  try {
    if (HAS_DB) {
      await store.saveSetting('global', 'anticall', { enabled: !!enabled });
    } else {
      if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
      fs.writeFileSync(ANTICALL_PATH, JSON.stringify({ enabled: !!enabled }, null, 2));
    }
  } catch (e) {
    console.error('Error writing anticall state:', e);
  }
}

module.exports = {
  command: 'anticall',
  aliases: ['acall', 'callblock'],
  category: 'owner',
  description: 'Enable or disable auto-blocking of incoming calls',
  usage: '.anticall <on|off|status>',
  ownerOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const state = await readState();
    const sub = args.join(' ').trim().toLowerCase();

    if (!sub || !['on', 'off', 'status'].includes(sub)) {
      return await sock.sendMessage(chatId, {
        text: `❌ *Invalid option!*\n\nAvailable options:\n- on\n- off\n\nCurrent: ${state.enabled ? 'ON' : 'OFF'}`
      }, { quoted: message });
    }
    if (sub === 'status') {
      return await sock.sendMessage(chatId, { text: `✅ *Auto call reject: ${state.enabled ? 'ON' : 'OFF'}*` }, { quoted: message });
    }

    const enable = sub === 'on';
    await writeState(enable);
    await sock.sendMessage(chatId, { text: `✅ *Your auto call reject ${enable ? 'ENABLED' : 'DISABLED'}*` }, { quoted: message });
  },

  readState,
  writeState
};
