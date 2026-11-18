/** Small AI helper used by .code / .copilot: ask({ key, system, user }) -> text (keeps short per-chat memory) */
const history = new Map();

async function generate(prompt) {
  try {
    const { ai } = require('./apiSwitch');
    const t = await ai(prompt);
    if (t) return String(t);
  } catch (_) {}
  try {
    const elite = require('./eliteApi');
    for (const ep of ['gemini', 'chatgpt', 'ai']) {
      try {
        const d = await elite.call(ep, prompt);
        const out = d && (d.result || d.response || d.message || d.data || d.text);
        if (out) return typeof out === 'string' ? out : JSON.stringify(out);
      } catch (_) {}
    }
  } catch (_) {}
  return '';
}

async function ask({ key = 'default', system = '', user = '' } = {}) {
  const h = history.get(key) || [];
  const prompt = [system, ...h.slice(-6), 'User: ' + user, 'Assistant:'].filter(Boolean).join('\n');
  const out = await generate(prompt);
  if (!out) throw new Error('AI APIs are busy right now, try again in a minute');
  h.push('User: ' + user, 'Assistant: ' + out.slice(0, 1500));
  history.set(key, h.slice(-12));
  return out;
}

module.exports = { chat: generate, generate, ask };
