const {
  createCanvas
} = require('@napi-rs/canvas');
const config = require("../../config");
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
  v1.textBaseline = 'bottom';
  v1.fillStyle = "#FFFFFF";
  v1.strokeStyle = '#000000';
  v1.lineWidth = 2;
  v1.strokeText(v4, v2 / 2, v3 - 10);
  v1.fillText(v4, v2 / 2, v3 - 10);
  v1.restore();
}
module.exports = {
  'name': "chromelogo",
  'category': "design",
  'description': "Create shiny chrome reflective text logos",
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (v7.length === 0) {
        await v5.sendMessage(v8, {
          'text': "✨ *CHROME LOGO*\n\n*chromelogo*\nchromelogo <text>\n\n*Example:*\nchromelogo WOLF\nchromelogo CHROME\nchromelogo SHINE\n\n" + ("> Powered by " + (config.botName || "JuneX-Ultra"))
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
      const v10 = await generateChromeLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "✨ *Chrome Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || "JuneX-Ultra") + '_'
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
      console.error("❌ [CHROMELOGO] ERROR:", v11);
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
async function generateChromeLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  const v15 = v14.createLinearGradient(0, 0, 800, 400);
  v15.addColorStop(0, '#2a2a2a');
  v15.addColorStop(0.5, "#1a1a1a");
  v15.addColorStop(1, "#0a0a0a");
  v14.fillStyle = v15;
  v14.fillRect(0, 0, 800, 400);
  drawChromeEnvironment(v14, 800, 400);
  const v16 = v14.createLinearGradient(0, 80, 0, 320);
  v16.addColorStop(0, '#FFFFFF');
  v16.addColorStop(0.1, "#F0F0F0");
  v16.addColorStop(0.2, "#D0D0D0");
  v16.addColorStop(0.35, "#A0A0A0");
  v16.addColorStop(0.5, "#707070");
  v16.addColorStop(0.65, "#404040");
  v16.addColorStop(0.8, "#202020");
  v16.addColorStop(0.9, '#000000');
  v16.addColorStop(1, '#303030');
  v14.font = "bold 88px \"Arial\"";
  v14.textAlign = "center";
  v14.textBaseline = "middle";
  createChromeReflectionEffect(v14, v12, 800, 400, v16);
  addChromeHighlights(v14, v12, 800, 400);
  drawChromeBorder(v14, 800, 400);
  addLightSources(v14, 800, 400);
  addChromeImperfections(v14, 800, 400);
  addWatermark(v14, 800, 400);
  return v13.toBuffer("image/png");
}
function drawChromeEnvironment(v17, v18, v19) {
  const v20 = [{
    'x': v18 * 0.2,
    'y': v19 * 0.3,
    'size': 0x50,
    'color': "rgba(255, 255, 255, 0.1)"
  }, {
    'x': v18 * 0.8,
    'y': v19 * 0.2,
    'size': 0x3c,
    'color': "rgba(255, 255, 255, 0.08)"
  }, {
    'x': v18 * 0.3,
    'y': v19 * 0.7,
    'size': 0x46,
    'color': "rgba(255, 255, 255, 0.06)"
  }, {
    'x': v18 * 0.7,
    'y': v19 * 0.6,
    'size': 0x32,
    'color': "rgba(255, 255, 255, 0.05)"
  }];
  v20.forEach(v21 => {
    const v22 = v17.createRadialGradient(v21.x, v21.y, 0, v21.x, v21.y, v21.size);
    v22.addColorStop(0, v21.color);
    v22.addColorStop(1, "transparent");
    v17.fillStyle = v22;
    v17.beginPath();
    v17.arc(v21.x, v21.y, v21.size, 0, Math.PI * 2);
    v17.fill();
  });
  v17.strokeStyle = "rgba(100, 100, 100, 0.1)";
  v17.lineWidth = 1;
  for (let v23 = 0; v23 < v19; v23 += 40) {
    v17.beginPath();
    v17.moveTo(0, v23);
    v17.lineTo(v18, v23);
    v17.stroke();
  }
  for (let v24 = 0; v24 < v18; v24 += 40) {
    v17.beginPath();
    v17.moveTo(v24, 0);
    v17.lineTo(v24, v19);
    v17.stroke();
  }
}
function createChromeReflectionEffect(v25, v26, v27, v28, v29) {
  const v30 = v27 / 2;
  const v31 = v28 / 2;
  v25.shadowColor = "rgba(0, 0, 0, 0.6)";
  v25.shadowBlur = 20;
  v25.shadowOffsetX = 8;
  v25.shadowOffsetY = 8;
  v25.fillStyle = "rgba(0, 0, 0, 0.4)";
  v25.fillText(v26.toUpperCase(), v30 + 5, v31 + 5);
  v25.shadowColor = 'transparent';
  v25.shadowBlur = 0;
  v25.shadowOffsetX = 0;
  v25.shadowOffsetY = 0;
  v25.fillStyle = v29;
  v25.fillText(v26.toUpperCase(), v30, v31);
  v25.strokeStyle = "rgba(255, 255, 255, 0.3)";
  v25.lineWidth = 1;
  v25.strokeText(v26.toUpperCase(), v30, v31);
}
function addChromeHighlights(v32, v33, v34, v35) {
  const v36 = v34 / 2;
  const v37 = v35 / 2;
  v32.save();
  const v38 = v32.createLinearGradient(v36 - 300, v37 - 80, v36 + 300, v37 - 20);
  v38.addColorStop(0, "rgba(255, 255, 255, 0)");
  v38.addColorStop(0.2, "rgba(255, 255, 255, 0.8)");
  v38.addColorStop(0.4, "rgba(255, 255, 255, 0.9)");
  v38.addColorStop(0.6, "rgba(255, 255, 255, 0.7)");
  v38.addColorStop(0.8, "rgba(255, 255, 255, 0.3)");
  v38.addColorStop(1, "rgba(255, 255, 255, 0)");
  v32.globalCompositeOperation = "screen";
  v32.fillStyle = v38;
  v32.font = "bold 88px \"Arial\"";
  v32.textAlign = "center";
  v32.textBaseline = "middle";
  v32.fillText(v33.toUpperCase(), v36, v37 - 2);
  v32.globalCompositeOperation = "source-over";
  const v39 = v32.measureText(v33.toUpperCase()).width;
  const v40 = [{
    'x': -0.35,
    'y': -0.4,
    'size': 0x6,
    'alpha': 0.9
  }, {
    'x': -0.15,
    'y': -0.45,
    'size': 0x8,
    'alpha': 0.8
  }, {
    'x': 0.05,
    'y': -0.4,
    'size': 0x7,
    'alpha': 0.85
  }, {
    'x': 0.25,
    'y': -0.45,
    'size': 0x6,
    'alpha': 0.8
  }, {
    'x': 0.4,
    'y': -0.35,
    'size': 0x5,
    'alpha': 0.7
  }];
  v40.forEach(v41 => {
    const v42 = v36 + v41.x * v39 / 2;
    const v43 = v37 + v41.y * 45;
    v32.fillStyle = "rgba(255, 255, 255, " + v41.alpha + ')';
    v32.beginPath();
    v32.arc(v42, v43, v41.size, 0, Math.PI * 2);
    v32.fill();
    v32.shadowColor = "rgba(255, 255, 255, 0.6)";
    v32.shadowBlur = 10;
    v32.fill();
  });
  v32.restore();
}
function drawChromeBorder(v44, v45, v46) {
  const v47 = v44.createLinearGradient(0, 0, v45, v46);
  v47.addColorStop(0, "#FFFFFF");
  v47.addColorStop(0.15, '#E0E0E0');
  v47.addColorStop(0.3, "#A0A0A0");
  v47.addColorStop(0.5, "#404040");
  v47.addColorStop(0.7, "#A0A0A0");
  v47.addColorStop(0.85, "#E0E0E0");
  v47.addColorStop(1, "#FFFFFF");
  v44.strokeStyle = v47;
  v44.lineWidth = 8;
  v44.shadowColor = "rgba(255, 255, 255, 0.3)";
  v44.shadowBlur = 15;
  v44.strokeRect(12, 12, v45 - 24, v46 - 24);
  v44.strokeStyle = "rgba(255, 255, 255, 0.5)";
  v44.lineWidth = 2;
  v44.shadowBlur = 0;
  v44.strokeRect(25, 25, v45 - 50, v46 - 50);
  drawChromeCorners(v44, v45, v46);
}
function drawChromeCorners(v48, v49, v50) {
  v48.strokeStyle = "rgba(255, 255, 255, 0.6)";
  v48.lineWidth = 3;
  v48.beginPath();
  v48.moveTo(20, 55);
  v48.lineTo(20, 20);
  v48.lineTo(55, 20);
  v48.stroke();
  v48.beginPath();
  v48.moveTo(v49 - 20 - 35, 20);
  v48.lineTo(v49 - 20, 20);
  v48.lineTo(v49 - 20, 55);
  v48.stroke();
  v48.beginPath();
  v48.moveTo(20, v50 - 20 - 35);
  v48.lineTo(20, v50 - 20);
  v48.lineTo(55, v50 - 20);
  v48.stroke();
  v48.beginPath();
  v48.moveTo(v49 - 20 - 35, v50 - 20);
  v48.lineTo(v49 - 20, v50 - 20);
  v48.lineTo(v49 - 20, v50 - 20 - 35);
  v48.stroke();
}
function addLightSources(v51, v52, v53) {
  v51.save();
  v51.globalAlpha = 0.3;
  const v54 = [{
    'x': v52 * 0.25,
    'y': v53 * 0.25,
    'size': 0xf
  }, {
    'x': v52 * 0.75,
    'y': v53 * 0.3,
    'size': 0xc
  }, {
    'x': v52 * 0.35,
    'y': v53 * 0.7,
    'size': 0xa
  }, {
    'x': v52 * 0.65,
    'y': v53 * 0.65,
    'size': 0x8
  }];
  v54.forEach(v55 => {
    const v56 = v51.createRadialGradient(v55.x, v55.y, 0, v55.x, v55.y, v55.size * 3);
    v56.addColorStop(0, "rgba(255, 255, 255, 0.8)");
    v56.addColorStop(0.5, "rgba(255, 255, 255, 0.3)");
    v56.addColorStop(1, "transparent");
    v51.fillStyle = v56;
    v51.beginPath();
    v51.arc(v55.x, v55.y, v55.size * 3, 0, Math.PI * 2);
    v51.fill();
  });
  v51.restore();
}
function addChromeImperfections(v57, v58, v59) {
  v57.save();
  v57.globalAlpha = 0.1;
  v57.strokeStyle = "rgba(255, 255, 255, 0.3)";
  v57.lineWidth = 0.5;
  for (let v60 = 0; v60 < 20; v60++) {
    const v61 = Math.random() * v58;
    const v62 = Math.random() * v59;
    const v63 = 10 + Math.random() * 30;
    const v64 = Math.random() * Math.PI;
    v57.beginPath();
    v57.moveTo(v61, v62);
    v57.lineTo(v61 + Math.cos(v64) * v63, v62 + Math.sin(v64) * v63);
    v57.stroke();
  }
  v57.fillStyle = "rgba(255, 255, 255, 0.2)";
  for (let v65 = 0; v65 < 30; v65++) {
    const v66 = Math.random() * v58;
    const v67 = Math.random() * v59;
    const v68 = Math.random() * 1.5;
    v57.beginPath();
    v57.arc(v66, v67, v68, 0, Math.PI * 2);
    v57.fill();
  }
  v57.restore();
}
async function generateSimpleChromeLogo(v69) {
  const v70 = createCanvas(600, 300);
  const v71 = v70.getContext('2d');
  v71.fillStyle = "#1a1a1a";
  v71.fillRect(0, 0, 600, 300);
  const v72 = v71.createLinearGradient(0, 40, 0, 260);
  v72.addColorStop(0, "#FFFFFF");
  v72.addColorStop(0.2, "#E0E0E0");
  v72.addColorStop(0.4, "#A0A0A0");
  v72.addColorStop(0.6, '#606060');
  v72.addColorStop(0.8, "#A0A0A0");
  v72.addColorStop(1, "#E0E0E0");
  v71.font = "bold 75px Arial";
  v71.fillStyle = v72;
  v71.textAlign = 'center';
  v71.textBaseline = 'middle';
  v71.shadowColor = "rgba(255, 255, 255, 0.3)";
  v71.shadowBlur = 10;
  v71.fillText(v69.toUpperCase(), 300, 150);
  v71.strokeStyle = v72;
  v71.lineWidth = 4;
  v71.strokeRect(10, 10, 580, 280);
  return v70.toBuffer('image/png');
}
