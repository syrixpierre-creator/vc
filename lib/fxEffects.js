/**
 * QUEEN AKUMA v3.4.0 — Image Effects (Levanter editor port, Jimp local — no API)
 * 17 effects. .fx <effect> on a photo. Jimp 1.6.1 API.
 */
const { Jimp } = require('jimp');

const EFFECTS = {
  sketch: { desc: 'Pencil sketch jaisa', run: (img) => img.greyscale().contrast(0.5).brightness(1.1) },
  pencil: { desc: 'Halka pencil drawing', run: (img) => img.greyscale().brightness(1.2).contrast(0.6) },
  cartoon: { desc: 'Cartoon/poster look', run: (img) => img.posterize(3).contrast(0.4) },
  zombie: { desc: 'Hara-bhara zombie', run: (img) => img.color([{ apply: 'green', params: [60] }]).brightness(0.85).contrast(0.3) },
  makeup: { desc: 'Soft glam look', run: (img) => img.brightness(1.15).contrast(0.15).blur(1).color([{ apply: 'red', params: [20] }, { apply: 'blue', params: [20] }]) },
  bokeh: { desc: 'Blurry dreamy', run: (img) => img.blur(6).brightness(1.05) },
  bloody: { desc: 'Khoon wala red', run: (img) => img.color([{ apply: 'red', params: [80] }]).contrast(0.4).brightness(0.9) },
  horned: { desc: 'Dark demonic', run: (img) => img.brightness(0.6).contrast(0.5).color([{ apply: 'red', params: [40] }]) },
  enhance: { desc: 'Photo sharp + bright', run: (img) => img.contrast(0.4).brightness(1.1) },
  demon: { desc: 'Ulta + laal demon', run: (img) => img.invert().color([{ apply: 'red', params: [60] }]).contrast(0.4) },
  skull: { desc: 'Dead black-white', run: (img) => img.greyscale().contrast(0.7).brightness(0.9) },
  wanted: { desc: 'Purana wanted poster', run: (img) => img.sepia().contrast(0.3).brightness(0.95) },
  kiss: { desc: 'Romantic pink', run: (img) => img.color([{ apply: 'red', params: [30] }, { apply: 'blue', params: [25] }]).blur(1).brightness(1.1) },
  look: { desc: 'Bright + colourful', run: (img) => img.brightness(1.1).contrast(0.3).color([{ apply: 'saturate', params: [30] }]) },
  color: { desc: 'Rang bhadkao', run: (img) => img.color([{ apply: 'saturate', params: [50] }]).contrast(0.2) },
  dark: { desc: 'Andhera moody', run: (img) => img.brightness(0.5).contrast(0.15) },
  gandm: { desc: 'Black & white', run: (img) => img.greyscale() },
};
function list() { return Object.entries(EFFECTS).map(([name, e]) => ({ name, desc: e.desc })); }
async function applyEffect(buffer, effect) {
  const e = EFFECTS[effect];
  if (!e) return { ok: false, error: `Effect "${effect}" nahi hai. Dekho: .fx list` };
  try {
    const img = await Jimp.read(buffer);
    e.run(img);
    const out = await img.getBuffer('image/jpeg');
    return { ok: true, buffer: out };
  } catch (err) {
    return { ok: false, error: 'Effect lagate waqt error: ' + String(err.message || err).slice(0, 120) };
  }
}
module.exports = { EFFECTS, list, applyEffect };
