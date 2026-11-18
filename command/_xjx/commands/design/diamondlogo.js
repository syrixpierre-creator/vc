const {
  createCanvas
} = require('@napi-rs/canvas');
const config = require('../../config');
function getBotName() {
  return config.botName || "JuneX-Ultra";
}
function getFooter() {
  return "> Powered by " + (config.botName || "JuneX-Ultra");
}
function addWatermark(v1, v2, v3, v4 = config.botName || "JuneX-Ultra") {
  v1.save();
  v1.shadowColor = "transparent";
  v1.shadowBlur = 0;
  v1.globalAlpha = 0.6;
  v1.font = "bold 16px Arial";
  v1.textAlign = "center";
  v1.textBaseline = "bottom";
  v1.fillStyle = "#FFFFFF";
  v1.strokeStyle = "#000000";
  v1.lineWidth = 2;
  v1.strokeText(v4, v2 / 2, v3 - 10);
  v1.fillText(v4, v2 / 2, v3 - 10);
  v1.restore();
}
module.exports = {
  'name': "diamondlogo",
  'description': "Create brilliant diamond crystal text logos",
  'category': "design",
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (v7.length === 0) {
        await v5.sendMessage(v8, {
          'text': "💎 *DIAMOND LOGO*\n\n*diamondlogo*\ndiamondlogo <text>\n\n*Example:*\ndiamondlogo WOLF\ndiamondlogo DIAMOND\ndiamondlogo CRYSTAL\n\n" + ("> Powered by " + (config.botName || "JuneX-Ultra"))
        }, {
          'quoted': v6
        });
        return;
      }
      const v9 = v7.join(" ");
      if (v9.length > 12) {
        await v5.sendMessage(v8, {
          'text': "❌ *ERROR*\n\nText too long!\nMaximum 12 characters\nYour text: \"" + v9 + "\" (" + v9.length + " chars)"
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
      const v10 = await generateDiamondLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "💎 *Diamond Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || "JuneX-Ultra") + '_'
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
      console.error("❌ [DIAMONDLOGO] ERROR:", v11);
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
async function generateDiamondLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  v14.fillStyle = "#050514";
  v14.fillRect(0, 0, 800, 400);
  drawStarfieldBackground(v14, 800, 400);
  createDiamondFacets(v14, v12, 800, 400);
  addDiamondReflections(v14, v12, 800, 400);
  addRainbowRefraction(v14, 800, 400);
  addDiamondSparkles(v14, 800, 400);
  drawDiamondBorder(v14, 800, 400);
  addWatermark(v14, 800, 400);
  return v13.toBuffer("image/png");
}
function drawStarfieldBackground(v15, v16, v17) {
  v15.fillStyle = "#FFFFFF";
  for (let v18 = 0; v18 < 200; v18++) {
    const v19 = Math.random() * v16;
    const v20 = Math.random() * v17;
    const v21 = Math.random() * 1.5;
    const v22 = 0.3 + Math.random() * 0.7;
    v15.globalAlpha = v22;
    v15.beginPath();
    v15.arc(v19, v20, v21, 0, Math.PI * 2);
    v15.fill();
  }
  v15.globalAlpha = 1;
  const v23 = v15.createRadialGradient(v16 * 0.7, v17 * 0.3, 0, v16 * 0.7, v17 * 0.3, 300);
  v23.addColorStop(0, "rgba(30, 30, 80, 0.3)");
  v23.addColorStop(1, "transparent");
  v15.fillStyle = v23;
  v15.fillRect(0, 0, v16, v17);
}
function createDiamondFacets(v24, v25, v26, v27) {
  const v28 = v26 / 2;
  const v29 = v27 / 2;
  for (let v30 = 0; v30 < 8; v30++) {
    const v31 = v30 * 1.5;
    const v32 = 0.1 + v30 / 8 * 0.4;
    const v33 = 210 + v30 * 5;
    const v34 = 'hsla(' + v33 + ", 30%, " + (80 - v30 * 5) + "%, " + v32 + ')';
    v24.fillStyle = v34;
    v24.font = "bold 90px \"Arial\"";
    v24.textAlign = 'center';
    v24.textBaseline = 'middle';
    v24.fillText(v25.toUpperCase(), v28 + v31, v29 + v31);
  }
  v24.fillStyle = "rgba(255, 255, 255, 0.9)";
  v24.font = "bold 90px \"Arial\"";
  v24.textAlign = 'center';
  v24.textBaseline = "middle";
  v24.fillText(v25.toUpperCase(), v28, v29);
}
function addDiamondReflections(v35, v36, v37, v38) {
  const v39 = v37 / 2;
  const v40 = v38 / 2;
  v35.save();
  const v41 = v35.createLinearGradient(v39 - 250, v40 - 60, v39 + 250, v40 + 40);
  v41.addColorStop(0, "rgba(255, 255, 255, 0)");
  v41.addColorStop(0.3, "rgba(255, 255, 255, 0.9)");
  v41.addColorStop(0.5, "rgba(255, 255, 255, 0.95)");
  v41.addColorStop(0.7, "rgba(255, 255, 255, 0.8)");
  v41.addColorStop(1, "rgba(255, 255, 255, 0)");
  v35.globalCompositeOperation = 'screen';
  v35.fillStyle = v41;
  v35.font = "bold 90px \"Arial\"";
  v35.textAlign = 'center';
  v35.textBaseline = 'middle';
  v35.fillText(v36.toUpperCase(), v39, v40);
  v35.globalCompositeOperation = "source-over";
  const v42 = v35.measureText(v36.toUpperCase()).width;
  const v43 = [{
    'x': -0.4,
    'y': -0.3,
    'size': 0xc,
    'brightness': 0.9
  }, {
    'x': -0.25,
    'y': -0.4,
    'size': 0x8,
    'brightness': 0.8
  }, {
    'x': -0.1,
    'y': -0.35,
    'size': 0xa,
    'brightness': 0.85
  }, {
    'x': 0.05,
    'y': -0.4,
    'size': 0x9,
    'brightness': 0.8
  }, {
    'x': 0.2,
    'y': -0.35,
    'size': 0xb,
    'brightness': 0.9
  }, {
    'x': 0.35,
    'y': -0.3,
    'size': 0x7,
    'brightness': 0.75
  }, {
    'x': -0.3,
    'y': 0.2,
    'size': 0x6,
    'brightness': 0.7
  }, {
    'x': 0.25,
    'y': 0.25,
    'size': 0x5,
    'brightness': 0.6
  }];
  v43.forEach(v44 => {
    const v45 = v39 + v44.x * v42 / 2;
    const v46 = v40 + v44.y * 50;
    v35.fillStyle = "rgba(255, 255, 255, " + v44.brightness + ')';
    v35.beginPath();
    const v47 = v44.size;
    v35.moveTo(v45, v46 - v47);
    v35.lineTo(v45 + v47 * 0.7, v46);
    v35.lineTo(v45, v46 + v47);
    v35.lineTo(v45 - v47 * 0.7, v46);
    v35.closePath();
    v35.fill();
    v35.shadowColor = "rgba(255, 255, 255, 0.8)";
    v35.shadowBlur = 15;
    v35.fill();
  });
  v35.restore();
}
function addRainbowRefraction(v48, v49, v50) {
  const v51 = v49 / 2;
  const v52 = v50 / 2;
  v48.save();
  v48.globalCompositeOperation = "screen";
  const v53 = [{
    'color': "rgba(255, 0, 0, 0.3)",
    'angle': -0.3
  }, {
    'color': "rgba(255, 165, 0, 0.25)",
    'angle': -0.15
  }, {
    'color': "rgba(255, 255, 0, 0.2)",
    'angle': 0x0
  }, {
    'color': "rgba(0, 255, 0, 0.25)",
    'angle': 0.15
  }, {
    'color': "rgba(0, 0, 255, 0.3)",
    'angle': 0.3
  }, {
    'color': "rgba(75, 0, 130, 0.25)",
    'angle': 0.45
  }, {
    'color': "rgba(238, 130, 238, 0.2)",
    'angle': 0.6
  }];
  v53.forEach((v54, v55) => {
    const v56 = v54.angle;
    const v57 = 60 + v55 * 8;
    const v58 = v48.createRadialGradient(v51 + Math.cos(v56) * v57, v52 + Math.sin(v56) * v57, 0, v51 + Math.cos(v56) * v57, v52 + Math.sin(v56) * v57, 80);
    v58.addColorStop(0, v54.color);
    v58.addColorStop(1, "transparent");
    v48.fillStyle = v58;
    v48.beginPath();
    v48.arc(v51 + Math.cos(v56) * v57, v52 + Math.sin(v56) * v57, 80, 0, Math.PI * 2);
    v48.fill();
  });
  v48.restore();
}
function addDiamondSparkles(v59, v60, v61) {
  v59.save();
  v59.globalAlpha = 0.9;
  for (let v62 = 0; v62 < 50; v62++) {
    const v63 = Math.random() * v60;
    const v64 = Math.random() * v61;
    const v65 = 1 + Math.random() * 3;
    const v66 = 0.7 + Math.random() * 0.3;
    v59.fillStyle = "rgba(255, 255, 255, " + v66 + ')';
    v59.beginPath();
    v59.moveTo(v63, v64 - v65);
    v59.lineTo(v63 + v65 * 0.3, v64 - v65 * 0.3);
    v59.lineTo(v63 + v65, v64);
    v59.lineTo(v63 + v65 * 0.3, v64 + v65 * 0.3);
    v59.lineTo(v63, v64 + v65);
    v59.lineTo(v63 - v65 * 0.3, v64 + v65 * 0.3);
    v59.lineTo(v63 - v65, v64);
    v59.lineTo(v63 - v65 * 0.3, v64 - v65 * 0.3);
    v59.closePath();
    v59.fill();
    v59.shadowColor = "rgba(255, 255, 255, 0.8)";
    v59.shadowBlur = 10;
    v59.fill();
  }
  v59.shadowColor = 'transparent';
  v59.shadowBlur = 0;
  v59.restore();
}
function drawDiamondBorder(v67, v68, v69) {
  v67.strokeStyle = "rgba(200, 220, 255, 0.6)";
  v67.lineWidth = 6;
  v67.shadowColor = "rgba(100, 150, 255, 0.4)";
  v67.shadowBlur = 20;
  v67.strokeRect(15, 15, v68 - 30, v69 - 30);
  const v70 = [{
    'x': 0x1e,
    'y': 0x1e
  }, {
    'x': v68 - 30,
    'y': 0x1e
  }, {
    'x': 0x1e,
    'y': v69 - 30
  }, {
    'x': v68 - 30,
    'y': v69 - 30
  }];
  v70.forEach(v71 => {
    drawDiamondStud(v67, v71.x, v71.y, 8);
  });
  v67.shadowColor = "transparent";
  v67.shadowBlur = 0;
}
function drawDiamondStud(v72, v73, v74, v75) {
  v72.save();
  v72.fillStyle = "rgba(255, 255, 255, 0.9)";
  v72.beginPath();
  v72.moveTo(v73, v74 - v75);
  v72.lineTo(v73 + v75, v74);
  v72.lineTo(v73, v74 + v75);
  v72.lineTo(v73 - v75, v74);
  v72.closePath();
  v72.fill();
  v72.fillStyle = "rgba(255, 255, 255, 0.6)";
  v72.beginPath();
  v72.moveTo(v73 - v75 * 0.3, v74 - v75 * 0.3);
  v72.lineTo(v73, v74 - v75 * 0.1);
  v72.lineTo(v73 + v75 * 0.1, v74);
  v72.lineTo(v73 - v75 * 0.1, v74 + v75 * 0.3);
  v72.closePath();
  v72.fill();
  v72.restore();
}
async function generateSimpleDiamondLogo(v76) {
  const v77 = createCanvas(600, 300);
  const v78 = v77.getContext('2d');
  v78.fillStyle = "#0a0a1a";
  v78.fillRect(0, 0, 600, 300);
  const v79 = v78.createLinearGradient(0, 40, 0, 260);
  v79.addColorStop(0, "#FFFFFF");
  v79.addColorStop(0.3, "#E0F0FF");
  v79.addColorStop(0.6, '#A0C0FF');
  v79.addColorStop(1, "#6080FF");
  v78.font = "bold 70px Arial";
  v78.fillStyle = v79;
  v78.textAlign = "center";
  v78.textBaseline = "middle";
  v78.shadowColor = "rgba(100, 150, 255, 0.6)";
  v78.shadowBlur = 20;
  v78.fillText(v76.toUpperCase(), 300, 150);
  v78.shadowBlur = 0;
  for (let v80 = 0; v80 < 10; v80++) {
    const v81 = 50 + Math.random() * 500;
    const v82 = 50 + Math.random() * 200;
    const v83 = 2 + Math.random() * 4;
    v78.fillStyle = "rgba(255, 255, 255, 0.8)";
    v78.beginPath();
    v78.arc(v81, v82, v83, 0, Math.PI * 2);
    v78.fill();
  }
  return v77.toBuffer("image/png");
}
