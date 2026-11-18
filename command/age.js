/**
 * QUEEN AKUMA • .age — Age calculator (v2.8.5)
 * Ported from gist (mistershubhamkumar/age.js) — original used the `bot()`
 * framework (pattern + message.send). Rewritten for QUEEN AKUMA's command
 * format (command + handler + sock.sendMessage).
 *
 * Gist logic kept: years/months/days/hours/minutes/seconds breakdown.
 * Improved: accurate calendar math (gist used 365d/30d approximations),
 * date validation + future-date check, DD-MM-YYYY support (gist: YYYY-MM-DD).
 *
 * Usage: .age 1998-01-01  |  .age 15-08-2005  |  .age 15/08/2005
 */
module.exports = {
  command: 'age',
  aliases: ['myage', 'calculateage', 'howold', 'umar'],
  category: 'tools',
  description: 'Calculate age from date of birth',
  usage: '.age 1998-01-01',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const input = (args || []).join(' ').trim();

    if (!input) return reply('*Example :* 1998-01-01\n\nUsage: `.age 1998-01-01`\nYa: `.age 15-08-2005`');

    // Parse: YYYY-MM-DD (gist format) ya DD-MM-YYYY / DD/MM/YYYY / DD.MM.YYYY
    let d, m, y;
    let match = input.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (match) { y = +match[1]; m = +match[2]; d = +match[3]; }
    else {
      match = input.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
      if (match) { d = +match[1]; m = +match[2]; y = +match[3]; }
    }
    if (!d || !m || !y) return reply('❌ Date samajh nahi aayi.\n*Example :* 1998-01-01');
    const birthDate = new Date(y, m - 1, d);
    if (birthDate.getFullYear() !== y || birthDate.getMonth() !== m - 1 || birthDate.getDate() !== d) {
      return reply('❌ Galat date hai. Sahi date likho.\n*Example :* 1998-01-01');
    }
    const currentDate = new Date();
    if (birthDate > currentDate) return reply('❌ Date of birth future me nahi ho sakti!');
    if (y < 1900) return reply('❌ Year 1900 se pehle ka nahi ho sakta.');

    // Accurate calendar age (years/months/days with borrow)
    let years = currentDate.getFullYear() - y;
    let months = currentDate.getMonth() - (m - 1);
    let days = currentDate.getDate() - d;
    if (days < 0) {
      months--;
      days += new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    }
    if (months < 0) { years--; months += 12; }

    // Gist-style totals (hours/minutes/seconds)
    const ageInMs = currentDate - birthDate;
    const ageInSeconds = ageInMs / 1000;
    const ageInMinutes = ageInSeconds / 60;
    const ageInHours = ageInMinutes / 60;
    const ageInDays = ageInHours / 24;
    const hours = Math.floor(ageInHours % 24);
    const minutes = Math.floor(ageInMinutes % 60);
    const seconds = Math.floor(ageInSeconds % 60);
    const totalDays = Math.floor(ageInDays);

    // Next birthday + zodiac
    const isBdayToday = currentDate.getMonth() === m - 1 && currentDate.getDate() === d;
    let next = new Date(currentDate.getFullYear(), m - 1, d);
    if (m === 2 && d === 29 && next.getMonth() !== 1) next = new Date(next.getFullYear(), 1, 28);
    if (!isBdayToday && next < currentDate) {
      next = new Date(currentDate.getFullYear() + 1, m - 1, d);
      if (m === 2 && d === 29 && next.getMonth() !== 1) next = new Date(next.getFullYear(), 1, 28);
    }
    const daysToBday = isBdayToday ? 0 : Math.ceil((next - currentDate) / 86400000);
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const bornDay = weekdays[birthDate.getDay()];
    const zodiac = getZodiac(d, m);

    const pad = (n) => String(n).padStart(2, '0');
    let text =
      `🎂 *Your age is:*\n\n` +
      `*Years:* ${years}\n` +
      `*Months:* ${months}\n` +
      `*Days:* ${days}\n` +
      `*Hours:* ${hours}\n` +
      `*Minutes:* ${minutes}\n` +
      `*Seconds:* ${seconds}\n\n` +
      `📅 *DOB:* ${pad(d)}-${pad(m)}-${y} (${bornDay})\n` +
      `📆 *Total days lived:* ${totalDays.toLocaleString('en-IN')}\n` +
      `♈ *Zodiac:* ${zodiac}`;
    text += isBdayToday
      ? `\n\n🎉 *HAPPY BIRTHDAY!* Aaj tumhara birthday hai! 🎂🎈`
      : `\n🎁 *Next birthday:* ${daysToBday} din baad (${pad(next.getDate())}-${pad(next.getMonth() + 1)}-${next.getFullYear()})`;
    return reply(text);
  }
};

function getZodiac(d, m) {
  const z = [
    [3, 21, 4, 19, 'Aries ♈'], [4, 20, 5, 20, 'Taurus ♉'], [5, 21, 6, 20, 'Gemini ♊'],
    [6, 21, 7, 22, 'Cancer ♋'], [7, 23, 8, 22, 'Leo ♌'], [8, 23, 9, 22, 'Virgo ♍'],
    [9, 23, 10, 22, 'Libra ♎'], [10, 23, 11, 21, 'Scorpio ♏'], [11, 22, 12, 21, 'Sagittarius ♐'],
    [12, 22, 1, 19, 'Capricorn ♑'], [1, 20, 2, 18, 'Aquarius ♒'], [2, 19, 3, 20, 'Pisces ♓']
  ];
  for (const [sm, sd, em, ed, name] of z) {
    if ((m === sm && d >= sd) || (m === em && d <= ed)) return name;
  }
  return '—';
}
