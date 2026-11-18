const {
  createCanvas
} = require("@napi-rs/canvas");
const config = require("../../config");
function getBotName() {
  return config.botName || 'JuneX-Ultra';
}
function getFooter() {
  return "> Powered by " + (config.botName || 'JuneX-Ultra');
}
function addWatermark(v1, v2, v3, v4 = config.botName || 'JuneX-Ultra') {
  v1.save();
  v1.shadowColor = "transparent";
  v1.shadowBlur = 0;
  v1.globalAlpha = 0.6;
  v1.font = "bold 16px Arial";
  v1.textAlign = "center";
  v1.textBaseline = 'bottom';
  v1.fillStyle = '#FFFFFF';
  v1.strokeStyle = "#000000";
  v1.lineWidth = 2;
  v1.strokeText(v4, v2 / 2, v3 - 10);
  v1.fillText(v4, v2 / 2, v3 - 10);
  v1.restore();
}
module.exports = {
  'name': "gradientlogo",
  'description': "Create beautiful gradient style text logos",
  'category': "design",
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (v7.length === 0) {
        await v5.sendMessage(v8, {
          'text': "🌈 *GRADIENT LOGO*\n\n*gradientlogo*\ngradientlogo <text>\n\n*Example:*\ngradientlogo WOLF\ngradientlogo GRADIENT\ngradientlogo COLORFUL\n\n" + ("> Powered by " + (config.botName || 'JuneX-Ultra'))
        }, {
          'quoted': v6
        });
        return;
      }
      const v9 = v7.join(" ");
      if (v9.length > 15) {
        await v5.sendMessage(v8, {
          'text': "❌ *ERROR*\n\nText too long!\nMaximum 15 characters\nYour text: \"" + v9 + "\" (" + v9.length + " chars)"
        }, {
          'quoted': v6
        });
        return;
      }
      await v5.sendMessage(v8, {
        'react': {
          'text': '⏳',
          'key': v6.key
        }
      });
      const v10 = await generateGradientLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "🌈 *Gradient Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || 'JuneX-Ultra') + '_'
      }, {
        'quoted': v6
      });
      await v5.sendMessage(v8, {
        'react': {
          'text': '✅',
          'key': v6.key
        }
      });
    } catch (v11) {
      console.error("❌ [GRADIENTLOGO] ERROR:", v11);
      await v5.sendMessage(v8, {
        'react': {
          'text': '❌',
          'key': v6.key
        }
      })['catch'](() => {});
      await v5.sendMessage(v8, {
        'text': "❌ *ERROR*\n\n" + v11.message + "\nPlease try again with shorter text"
      }, {
        'quoted': v6
      });
    }
  }
};
async function generateGradientLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  const v15 = getRandomGradientColors();
  const v16 = v14.createLinearGradient(0, 0, 800, 400);
  v16.addColorStop(0, v15[0]);
  v16.addColorStop(0.5, v15[1]);
  v16.addColorStop(1, v15[2]);
  v14.fillStyle = v16;
  v14.fillRect(0, 0, 800, 400);
  addPatternOverlay(v14, 800, 400);
  const v17 = v14.createLinearGradient(0, 150, 0, 250);
  v17.addColorStop(0, getContrastColor(v15[0]));
  v17.addColorStop(0.5, getContrastColor(v15[1]));
  v17.addColorStop(1, getContrastColor(v15[2]));
  v14.font = "bold 80px \"Arial\"";
  v14.textAlign = 'center';
  v14.textBaseline = 'middle';
  v14.shadowColor = "rgba(0, 0, 0, 0.5)";
  v14.shadowBlur = 15;
  v14.shadowOffsetX = 3;
  v14.shadowOffsetY = 3;
  v14.fillStyle = v17;
  v14.fillText(v12.toUpperCase(), 400, 200);
  v14.strokeStyle = "rgba(255, 255, 255, 0.3)";
  v14.lineWidth = 2;
  v14.strokeText(v12.toUpperCase(), 400, 200);
  v14.shadowColor = "transparent";
  v14.shadowBlur = 0;
  v14.shadowOffsetX = 0;
  v14.shadowOffsetY = 0;
  drawModernBorder(v14, 800, 400, v15);
  addFloatingParticles(v14, 800, 400, v15);
  addWatermark(v14, 800, 400);
  return v13.toBuffer('image/png');
}
function getRandomGradientColors() {
  const v18 = [["#667eea", '#764ba2', "#f093fb"], ["#4facfe", "#00f2fe", "#43e97b"], ["#fa709a", "#fee140", "#ff6b6b"], ["#a8edea", "#fed6e3", "#a8edea"], ["#ff9a9e", "#fecfef", "#fecfef"], ['#a1c4fd', "#c2e9fb", "#a1c4fd"], ["#d4fc79", "#96e6a1", "#d4fc79"], ["#fad0c4", "#ffd1ff", "#fad0c4"], ["#ffecd2", '#fcb69f', "#ffecd2"], ["#a3bded", "#6991c7", "#a3bded"], ['#ff9a8b', "#ff6a88", "#ff99ac"], ["#cd9cf2", "#f6f3ff", "#cd9cf2"], ["#6a11cb", "#2575fc", "#6a11cb"], ["#ff8177", '#ff867a', "#ff8c7f"], ["#74ebd5", "#9face6", "#74ebd5"]];
  return v18[Math.floor(Math.random() * v18.length)];
}
function getContrastColor(v19) {
  const v20 = parseInt(v19.slice(1, 3), 16);
  const v21 = parseInt(v19.slice(3, 5), 16);
  const v22 = parseInt(v19.slice(5, 7), 16);
  const v23 = (0.299 * v20 + 0.587 * v21 + 0.114 * v22) / 255;
  return v23 > 0.5 ? "#000000" : "#FFFFFF";
}
function addPatternOverlay(v24, v25, v26) {
  v24.globalAlpha = 0.1;
  v24.strokeStyle = '#FFFFFF';
  v24.lineWidth = 1;
  for (let v27 = -v25; v27 < v25 * 2; v27 += 25) {
    v24.beginPath();
    v24.moveTo(v27, 0);
    v24.lineTo(v27 + v26, v26);
    v24.stroke();
  }
  for (let v28 = -v25; v28 < v25 * 2; v28 += 25) {
    v24.beginPath();
    v24.moveTo(v28, v26);
    v24.lineTo(v28 + v26, 0);
    v24.stroke();
  }
  v24.globalAlpha = 1;
}
function drawModernBorder(v29, v30, v31, v32) {
  const v33 = v29.createLinearGradient(0, 0, v30, v31);
  v33.addColorStop(0, v32[0]);
  v33.addColorStop(0.5, v32[1]);
  v33.addColorStop(1, v32[2]);
  v29.strokeStyle = v33;
  v29.lineWidth = 6;
  v29.shadowColor = v32[1];
  v29.shadowBlur = 10;
  v29.strokeRect(15, 15, v30 - 30, v31 - 30);
  v29.strokeStyle = "rgba(255, 255, 255, 0.3)";
  v29.lineWidth = 2;
  v29.shadowBlur = 0;
  v29.strokeRect(25, 25, v30 - 50, v31 - 50);
}
function addFloatingParticles(v34, v35, v36, v37) {
  v34.globalAlpha = 0.6;
  for (let v38 = 0; v38 < 30; v38++) {
    const v39 = Math.random() * v35;
    const v40 = Math.random() * v36;
    const v41 = Math.random() * 4 + 1;
    const v42 = Math.floor(Math.random() * v37.length);
    v34.fillStyle = v37[v42];
    v34.beginPath();
    v34.arc(v39, v40, v41, 0, Math.PI * 2);
    v34.fill();
  }
  v34.globalAlpha = 1;
}
async function generateCustomGradientLogo(v43, v44, v45, v46) {
  const v47 = createCanvas(800, 400);
  const v48 = v47.getContext('2d');
  const v49 = v48.createLinearGradient(0, 0, 800, 400);
  v49.addColorStop(0, v44 || "#667eea");
  v49.addColorStop(0.5, v45 || '#764ba2');
  v49.addColorStop(1, v46 || "#f093fb");
  v48.fillStyle = v49;
  v48.fillRect(0, 0, 800, 400);
  v48.font = "bold 80px \"Arial\"";
  v48.fillStyle = getContrastColor(v44);
  v48.textAlign = 'center';
  v48.textBaseline = "middle";
  v48.shadowColor = "rgba(0, 0, 0, 0.5)";
  v48.shadowBlur = 10;
  v48.fillText(v43.toUpperCase(), 400, 200);
  return v47.toBuffer("image/png");
}
