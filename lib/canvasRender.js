/** Calendar card renderer (PNG buffer). Needs @napi-rs/canvas or canvas; returns null when neither is installed. */
function getCanvas() {
  for (const m of ['@napi-rs/canvas', 'canvas']) { try { return require(m); } catch (_) {} }
  return null;
}

async function renderCalendarCard(o = {}) {
  const C = getCanvas();
  if (!C) return null;
  const W = 900, H = 760;
  const canvas = C.createCanvas(W, H);
  const g = canvas.getContext('2d');
  // background
  const bg = g.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0f172a'); bg.addColorStop(1, '#1e1b4b');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.textAlign = 'center';
  // header
  g.fillStyle = '#e2e8f0'; g.font = 'bold 44px sans-serif';
  g.fillText(`${o.monthName || ''} ${o.year || ''}`, W / 2, 80);
  g.fillStyle = '#94a3b8'; g.font = '24px sans-serif';
  g.fillText(`${o.weekday || ''}, ${o.fullDate || ''}  •  ${o.timeStr || ''}`, W / 2, 125);
  // grid
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const x0 = 60, cw = (W - 120) / 7, y0 = 190, ch = 70;
  g.font = 'bold 24px sans-serif'; g.fillStyle = '#a5b4fc';
  days.forEach((d, i) => g.fillText(d, x0 + cw * i + cw / 2, y0 - 25));
  const first = new Date(o.year, o.monthIdx, 1).getDay();
  const dim = new Date(o.year, o.monthIdx + 1, 0).getDate();
  g.font = '28px sans-serif';
  for (let d = 1; d <= dim; d++) {
    const idx = first + d - 1;
    const cx = x0 + cw * (idx % 7) + cw / 2, cy = y0 + ch * Math.floor(idx / 7) + 30;
    if (d === o.todayDate) { g.fillStyle = '#6366f1'; g.beginPath(); g.arc(cx, cy - 10, 28, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fff'; }
    else g.fillStyle = idx % 7 === 0 ? '#fca5a5' : '#e2e8f0';
    g.fillText(String(d), cx, cy);
  }
  // footer
  g.fillStyle = '#94a3b8'; g.font = '22px sans-serif';
  const info = [`Week ${o.weekNum || '-'} • Day ${o.dayOfYear || '-'}/${o.daysInYear || '-'}`, [o.region, o.country, o.timezone].filter(Boolean).join(', ')];
  if (o.tempC !== undefined) info.push(`${o.tempC}°C • ${o.condition || ''} • 💧${o.humidity || '-'}% • 💨${o.windKph || '-'} km/h`);
  info.forEach((t, i) => g.fillText(t, W / 2, 640 + i * 32));
  g.fillStyle = '#64748b'; g.font = '18px sans-serif'; g.fillText(o.botName || 'QUEEN AKUMA', W / 2, H - 14);
  return canvas.toBuffer('image/png');
}

module.exports = renderCalendarCard;
module.exports.renderCalendarCard = renderCalendarCard;
