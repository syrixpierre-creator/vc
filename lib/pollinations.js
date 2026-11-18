// QUEEN AKUMA v3.5.0 • lib/pollinations.js
// Free no-key AI text backend (QUEEN AKUMA aimodels.js se — text.pollinations.ai).
// QUEEN AKUMA ke AI commands ko GEMINI_API_KEY se aazad karta hai: Gemini fail ho ya
// key na ho to Pollinations models fallback ke roop me kaam karte hain.
const MODELS = {
  gpt: 'openai', mistral: 'mistral', gemini: 'gemini', deepseek: 'deepseek',
  llama: 'llama', claude: 'claude-hybridspace', qwen: 'qwen',
};

async function pollinationsText(prompt, model = 'openai', timeoutMs = 30000) {
  const encoded = encodeURIComponent(prompt);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`https://text.pollinations.ai/${encoded}?model=${model}`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'QUEEN-AKUMA/3.5.0', Accept: 'text/plain,*/*' },
    });
    if (!res.ok) throw new Error(`Pollinations HTTP ${res.status}`);
    const text = (await res.text()).trim();
    if (!text) throw new Error('Pollinations: empty reply');
    return text;
  } finally { clearTimeout(timer); }
}

// 3 models parallel race — jo pehle jawab de, wo jeetta hai (fast path).
async function pollinationsTextFast(prompt, timeoutMs = 25000) {
  const { raceFirst } = require('./multiApi');
  return raceFirst(
    ['openai', 'mistral', 'deepseek'].map((m) => () => pollinationsText(prompt, m, timeoutMs)),
    timeoutMs
  );
}

module.exports = { MODELS, pollinationsText, pollinationsTextFast };
