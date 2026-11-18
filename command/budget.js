/**
 * QUEEN AKUMA — Budget tracker (ported/adapted from Levanter style)
 * Commands: .budget  .income  .expense  .delbudget  .summary
 */
const db = require('../lib/jsondb');

const NAME = 'budget';

function getUserData(userId) {
  const data = db.load(NAME, { users: {} });
  if (!data.users[userId]) {
    data.users[userId] = { entries: [] };
  }
  return data;
}

function addEntry(userId, type, category, amount, remark = '') {
  const data = getUserData(userId);
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    type, // income | expense
    category: category || 'general',
    amount: parseFloat(amount),
    remark: remark || '',
    date: new Date().toISOString()
  };
  data.users[userId].entries.push(entry);
  db.save(NAME);
  return entry;
}

function delEntry(userId, id) {
  const data = getUserData(userId);
  const before = data.users[userId].entries.length;
  data.users[userId].entries = data.users[userId].entries.filter(e => e.id !== id && !e.id.startsWith(id));
  db.save(NAME);
  return data.users[userId].entries.length < before;
}

function getSummary(userId, fromDate, toDate) {
  const data = getUserData(userId);
  let entries = data.users[userId].entries;
  if (fromDate) {
    const from = new Date(fromDate);
    entries = entries.filter(e => new Date(e.date) >= from);
  }
  if (toDate) {
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);
    entries = entries.filter(e => new Date(e.date) <= to);
  }

  let income = 0, expense = 0;
  const byCat = {};
  for (const e of entries) {
    if (e.type === 'income') income += e.amount;
    else expense += e.amount;
    const key = `${e.type}:${e.category}`;
    byCat[key] = (byCat[key] || 0) + e.amount;
  }
  return { income, expense, balance: income - expense, entries, byCat };
}

module.exports = {
  command: 'budget',
  aliases: ['income', 'expense', 'delbudget', 'summary'],
  category: 'utility',
  description: 'Personal budget tracker (income / expense / summary)',
  usage: '.income salary,5000,monthly  |  .expense food,200  |  .summary  |  .delbudget <id>  |  .budget help',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const senderId = context.senderId || message.key.participant || chatId;
    const cmd = (message.body || '').toLowerCase().split(/\s+/)[0].replace(/^[.!#]/, '') || 'budget';
    const text = args.join(' ').trim();
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });

    // HELP
    if (cmd === 'budget' && (!text || text === 'help')) {
      return reply(
`💰 *BUDGET TRACKER* (new feature)

📌 *Commands:*
• *.income* category,amount,remark
  Example: \`.income salary,15000,monthly\`
• *.expense* category,amount,remark
  Example: \`.expense food,350,lunch\`
• *.summary* [from,to]   (YYYY-MM-DD)
  Example: \`.summary\` or \`.summary 2026-01-01,2026-11-06\`
• *.delbudget* <id>
  Example: \`.delbudget abc123\`
• *.budget help*

Data is stored per user in the bot.`
      );
    }

    // INCOME / EXPENSE
    if (cmd === 'income' || cmd === 'expense') {
      if (!text) {
        return reply(`❌ Format: \`.${cmd} category,amount,remark\`\nExample: \`.${cmd} food,200,dinner\``);
      }
      const parts = text.split(',').map(s => s.trim());
      const category = parts[0];
      const amount = parts[1];
      const remark = parts.slice(2).join(',') || '';
      if (!category || !amount || isNaN(parseFloat(amount))) {
        return reply(`❌ Invalid. Use: \`.${cmd} category,amount,remark\``);
      }
      const entry = addEntry(senderId, cmd, category, amount, remark);
      return reply(
`✅ *${cmd.toUpperCase()} added!*\n` +
`ID: \`${entry.id}\`\n` +
`Category: ${entry.category}\n` +
`Amount: ₹${entry.amount}\n` +
`Remark: ${entry.remark || '-'}\n` +
`Date: ${new Date(entry.date).toLocaleString('en-IN')}`
      );
    }

    // DELBUDGET
    if (cmd === 'delbudget') {
      if (!text) return reply('❌ Usage: `.delbudget <id>`');
      const ok = delEntry(senderId, text);
      return reply(ok ? `✅ Entry \`${text}\` deleted.` : `❌ Entry not found: \`${text}\``);
    }

    // SUMMARY
    if (cmd === 'summary') {
      let from = null, to = null;
      if (text) {
        const [f, t] = text.split(',').map(s => s.trim());
        from = f || null;
        to = t || null;
      }
      const s = getSummary(senderId, from, to);
      let msg = `📊 *BUDGET SUMMARY*\n\n`;
      msg += `🟢 Income : ₹${s.income.toFixed(2)}\n`;
      msg += `🔴 Expense: ₹${s.expense.toFixed(2)}\n`;
      msg += `💰 Balance: ₹${s.balance.toFixed(2)}\n`;
      msg += `📝 Entries: ${s.entries.length}\n\n`;

      if (s.entries.length) {
        msg += `*Recent entries:*\n`;
        s.entries.slice(-8).reverse().forEach(e => {
          const icon = e.type === 'income' ? '🟢' : '🔴';
          msg += `${icon} \`${e.id}\` ${e.category} ₹${e.amount} ${e.remark ? '(' + e.remark + ')' : ''}\n`;
        });
      }
      return reply(msg);
    }

    // fallback
    return reply('Use `.budget help` for usage.');
  }
};
