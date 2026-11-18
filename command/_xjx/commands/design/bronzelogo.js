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
  v1.textAlign = 'center';
  v1.textBaseline = "bottom";
  v1.fillStyle = '#FFFFFF';
  v1.strokeStyle = "#000000";
  v1.lineWidth = 2;
  v1.strokeText(v4, v2 / 2, v3 - 10);
  v1.fillText(v4, v2 / 2, v3 - 10);
  v1.restore();
}
module.exports = {
  'name': "bronzelogo",
  'category': "design",
  'description': "Create authentic bronze metallic text logos with patina effects",
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (v7.length === 0) {
        await v5.sendMessage(v8, {
          'text': "🟫 *BRONZE LOGO*\n\n*bronzelogo*\nbronzelogo <text>\n\n*Example:*\nbronzelogo WOLF\nbronzelogo BRONZE\nbronzelogo ANCIENT\n\n" + ("> Powered by " + (config.botName || 'JuneX-Ultra'))
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
      const v10 = await generateBronzeLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "🟫 *Bronze Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || 'JuneX-Ultra') + '_'
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
      console.error("❌ [BRONZELOGO] ERROR:", v11);
      await v5.sendMessage(v8, {
        'react': {
          'text': '❌',
          'key': v6.key
        }
      })["catch"](() => {});
      await v5.sendMessage(v8, {
        'text': "❌ *ERROR*\n\n" + v11.message + "\nPlease try again with shorter text"
      }, {
        'quoted': v6
      });
    }
  }
};
async function generateBronzeLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  v14.fillStyle = "#2a1e0f";
  v14.fillRect(0, 0, 800, 400);
  drawAntiqueBackground(v14, 800, 400);
  const v15 = v14.createLinearGradient(0, 100, 0, 300);
  v15.addColorStop(0, "#CD7F32");
  v15.addColorStop(0.15, '#B87333');
  v15.addColorStop(0.3, "#A65A29");
  v15.addColorStop(0.45, '#8B4513');
  v15.addColorStop(0.6, "#654321");
  v15.addColorStop(0.75, "#5D4037");
  v15.addColorStop(0.9, "#4E342E");
  v15.addColorStop(1, "#3E2723");
  v14.font = "bold 84px \"Arial\"";
  v14.textAlign = "center";
  v14.textBaseline = "middle";
  createBronze3DEffect(v14, v12, 800, 400, v15);
  addBronzePatina(v14, v12, 800, 400);
  addBronzeHighlights(v14, v12, 800, 400);
  drawAgedBorder(v14, 800, 400);
  addBronzeTexture(v14, 800, 400);
  addWatermark(v14, 800, 400);
  return v13.toBuffer("image/png");
}
function drawAntiqueBackground(v16, v17, v18) {
  const v19 = v16.createLinearGradient(0, 0, v17, v18);
  v19.addColorStop(0, '#3a2c1a');
  v19.addColorStop(0.5, "#2a1e0f");
  v19.addColorStop(1, '#1a140a');
  v16.fillStyle = v19;
  v16.fillRect(0, 0, v17, v18);
  v16.strokeStyle = "rgba(90, 70, 40, 0.1)";
  v16.lineWidth = 1;
  for (let v20 = 0; v20 < 200; v20++) {
    const v21 = Math.random() * v17;
    const v22 = Math.random() * v18;
    const v23 = 20 + Math.random() * 50;
    const v24 = Math.random() * Math.PI;
    v16.beginPath();
    v16.moveTo(v21, v22);
    v16.lineTo(v21 + Math.cos(v24) * v23, v22 + Math.sin(v24) * v23);
    v16.stroke();
  }
  v16.fillStyle = "rgba(60, 45, 20, 0.3)";
  for (let v25 = 0; v25 < 30; v25++) {
    const v26 = Math.random() * v17;
    const v27 = Math.random() * v18;
    const v28 = 5 + Math.random() * 15;
    v16.beginPath();
    v16.arc(v26, v27, v28, 0, Math.PI * 2);
    v16.fill();
  }
}
function createBronze3DEffect(v29, v30, v31, v32, v33) {
  const v34 = v31 / 2;
  const v35 = v32 / 2;
  for (let v36 = 8; v36 > 0; v36--) {
    const v37 = v36 * 1.5;
    const v38 = 0.08 + v36 / 8 * 0.25;
    const v39 = 30 - v36 * 3;
    v29.fillStyle = "rgba(" + v39 + ", " + (v39 - 10) + ", " + (v39 - 20) + ", " + v38 + ')';
    v29.fillText(v30.toUpperCase(), v34 + v37, v35 + v37);
  }
  v29.fillStyle = v33;
  v29.fillText(v30.toUpperCase(), v34, v35);
  v29.strokeStyle = "rgba(139, 69, 19, 0.4)";
  v29.lineWidth = 1.5;
  v29.strokeText(v30.toUpperCase(), v34, v35);
}
function addBronzePatina(v40, v41, v42, v43) {
  const v44 = v42 / 2;
  const v45 = v43 / 2;
  v40.save();
  const v46 = v40.createLinearGradient(v44 - 200, v45 + 30, v44 + 200, v45 - 20);
  v46.addColorStop(0, "rgba(83, 130, 85, 0.3)");
  v46.addColorStop(0.3, "rgba(67, 111, 77, 0.4)");
  v46.addColorStop(0.6, "rgba(53, 94, 59, 0.3)");
  v46.addColorStop(1, "transparent");
  v40.globalCompositeOperation = "overlay";
  v40.fillStyle = v46;
  v40.font = "bold 84px \"Arial\"";
  v40.textAlign = "center";
  v40.textBaseline = 'middle';
  v40.fillText(v41.toUpperCase(), v44, v45);
  v40.globalCompositeOperation = "source-over";
  const v47 = v40.measureText(v41.toUpperCase()).width;
  const v48 = [{
    'x': -0.35,
    'y': 0.2,
    'size': 0x8,
    'alpha': 0.4
  }, {
    'x': -0.15,
    'y': -0.1,
    'size': 0x6,
    'alpha': 0.3
  }, {
    'x': 0.1,
    'y': 0.3,
    'size': 0xa,
    'alpha': 0.5
  }, {
    'x': 0.3,
    'y': -0.2,
    'size': 0x7,
    'alpha': 0.4
  }, {
    'x': 0.4,
    'y': 0.1,
    'size': 0x5,
    'alpha': 0.3
  }];
  v48.forEach(v49 => {
    const v50 = v44 + v49.x * v47 / 2;
    const v51 = v45 + v49.y * 40;
    v40.fillStyle = "rgba(64, 130, 109, " + v49.alpha + ')';
    v40.beginPath();
    v40.arc(v50, v51, v49.size, 0, Math.PI * 2);
    v40.fill();
    v40.fillStyle = "rgba(83, 150, 120, " + v49.alpha * 0.7 + ')';
    v40.beginPath();
    v40.arc(v50 - v49.size * 0.3, v51 - v49.size * 0.3, v49.size * 0.5, 0, Math.PI * 2);
    v40.fill();
  });
  v40.restore();
}
function addBronzeHighlights(v52, v53, v54, v55) {
  const v56 = v54 / 2;
  const v57 = v55 / 2;
  v52.save();
  const v58 = v52.createLinearGradient(v56 - 250, v57 - 50, v56 + 250, v57 - 10);
  v58.addColorStop(0, "rgba(255, 215, 0, 0.4)");
  v58.addColorStop(0.3, "rgba(255, 200, 100, 0.3)");
  v58.addColorStop(0.6, "rgba(205, 170, 80, 0.2)");
  v58.addColorStop(1, "transparent");
  v52.globalCompositeOperation = 'screen';
  v52.fillStyle = v58;
  v52.font = "bold 84px \"Arial\"";
  v52.textAlign = "center";
  v52.textBaseline = 'middle';
  v52.fillText(v53.toUpperCase(), v56, v57 - 2);
  v52.globalCompositeOperation = 'source-over';
  const v59 = v52.measureText(v53.toUpperCase()).width;
  const v60 = [{
    'x': -0.3,
    'y': -0.35,
    'size': 0x4,
    'alpha': 0.6
  }, {
    'x': -0.1,
    'y': -0.4,
    'size': 0x5,
    'alpha': 0.7
  }, {
    'x': 0.15,
    'y': -0.35,
    'size': 0x3,
    'alpha': 0.5
  }, {
    'x': 0.35,
    'y': -0.3,
    'size': 0x4,
    'alpha': 0.6
  }];
  v60.forEach(v61 => {
    const v62 = v56 + v61.x * v59 / 2;
    const v63 = v57 + v61.y * 45;
    v52.fillStyle = "rgba(255, 230, 150, " + v61.alpha + ')';
    v52.beginPath();
    v52.arc(v62, v63, v61.size, 0, Math.PI * 2);
    v52.fill();
  });
  v52.restore();
}
function drawAgedBorder(v64, v65, v66) {
  const v67 = v64.createLinearGradient(0, 0, v65, v66);
  v67.addColorStop(0, "#CD7F32");
  v67.addColorStop(0.3, "#B87333");
  v67.addColorStop(0.5, "#8B4513");
  v67.addColorStop(0.7, '#B87333');
  v67.addColorStop(1, "#CD7F32");
  v64.strokeStyle = v67;
  v64.lineWidth = 8;
  v64.shadowColor = "rgba(139, 69, 19, 0.5)";
  v64.shadowBlur = 15;
  v64.strokeRect(18, 18, v65 - 36, v66 - 36);
  v64.strokeStyle = "rgba(139, 69, 19, 0.4)";
  v64.lineWidth = 2;
  v64.shadowBlur = 0;
  v64.strokeRect(30, 30, v65 - 60, v66 - 60);
  drawBronzeRivets(v64, v65, v66);
}
function drawBronzeRivets(v68, v69, v70) {
  v68.fillStyle = "#B87333";
  const v71 = [{
    'x': 0x1e,
    'y': 0x1e
  }, {
    'x': v69 - 30,
    'y': 0x1e
  }, {
    'x': 0x1e,
    'y': v70 - 30
  }, {
    'x': v69 - 30,
    'y': v70 - 30
  }];
  v71.forEach(v72 => {
    v68.beginPath();
    v68.arc(v72.x, v72.y, 6, 0, Math.PI * 2);
    v68.fill();
    v68.fillStyle = "rgba(255, 215, 0, 0.6)";
    v68.beginPath();
    v68.arc(v72.x - 2, v72.y - 2, 2, 0, Math.PI * 2);
    v68.fill();
    v68.fillStyle = "#B87333";
  });
}
function addBronzeTexture(v73, v74, v75) {
  v73.save();
  v73.globalAlpha = 0.3;
  for (let v76 = 0; v76 < 100; v76++) {
    const v77 = Math.random() * v74;
    const v78 = Math.random() * v75;
    const v79 = 0.5 + Math.random() * 2;
    v73.fillStyle = 'rgba(' + (180 + Math.random() * 40) + ", " + (120 + Math.random() * 30) + ", " + (50 + Math.random() * 20) + ", 0.8)";
    v73.beginPath();
    v73.arc(v77, v78, v79, 0, Math.PI * 2);
    v73.fill();
  }
  v73.strokeStyle = "rgba(139, 69, 19, 0.4)";
  v73.lineWidth = 1;
  for (let v80 = 0; v80 < 30; v80++) {
    const v81 = Math.random() * v74;
    const v82 = Math.random() * v75;
    const v83 = 10 + Math.random() * 40;
    const v84 = Math.random() * Math.PI;
    v73.beginPath();
    v73.moveTo(v81, v82);
    v73.lineTo(v81 + Math.cos(v84) * v83, v82 + Math.sin(v84) * v83);
    v73.stroke();
  }
  v73.restore();
}
async function generateSimpleBronzeLogo(v85) {
  const v86 = createCanvas(600, 300);
  const v87 = v86.getContext('2d');
  v87.fillStyle = "#2a1e0f";
  v87.fillRect(0, 0, 600, 300);
  const v88 = v87.createLinearGradient(0, 50, 0, 250);
  v88.addColorStop(0, "#CD7F32");
  v88.addColorStop(0.4, "#B87333");
  v88.addColorStop(0.7, '#8B4513');
  v88.addColorStop(1, '#654321');
  v87.font = "bold 70px Arial";
  v87.fillStyle = v88;
  v87.textAlign = "center";
  v87.textBaseline = "middle";
  v87.shadowColor = "rgba(139, 69, 19, 0.5)";
  v87.shadowBlur = 15;
  v87.shadowOffsetX = 4;
  v87.shadowOffsetY = 4;
  v87.fillText(v85.toUpperCase(), 300, 150);
  v87.strokeStyle = "#B87333";
  v87.lineWidth = 5;
  v87.strokeRect(15, 15, 570, 270);
  return v86.toBuffer("image/png");
}
