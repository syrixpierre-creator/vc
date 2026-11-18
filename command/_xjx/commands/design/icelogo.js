const {
  createCanvas
} = require('@napi-rs/canvas');
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
  v1.fillStyle = "#FFFFFF";
  v1.strokeStyle = "#000000";
  v1.lineWidth = 2;
  v1.strokeText(v4, v2 / 2, v3 - 10);
  v1.fillText(v4, v2 / 2, v3 - 10);
  v1.restore();
}
module.exports = {
  'name': 'icelogo',
  'description': "Create frozen ice crystal text logos",
  'category': "design",
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (v7.length === 0) {
        await v5.sendMessage(v8, {
          'text': "❄️ *ICE LOGO*\n\n*icelogo*\nicelogo <text>\n\n*Example:*\nicelogo WOLF\nicelogo FROST\nicelogo ICE\n\n" + ("> Powered by " + (config.botName || 'JuneX-Ultra'))
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
      const v10 = await generateIceLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "❄️ *Ice Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || 'JuneX-Ultra') + '_'
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
      console.error("❌ [ICELOGO] ERROR:", v11);
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
async function generateIceLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  v14.fillStyle = '#0a1428';
  v14.fillRect(0, 0, 800, 400);
  drawFrozenBackground(v14, 800, 400);
  const v15 = v14.createLinearGradient(0, 100, 0, 300);
  v15.addColorStop(0, "#FFFFFF");
  v15.addColorStop(0.2, "#E8F4FF");
  v15.addColorStop(0.4, "#C8E8FF");
  v15.addColorStop(0.6, "#A0D8FF");
  v15.addColorStop(0.8, "#78C8FF");
  v15.addColorStop(1, '#50B8FF');
  v14.font = "bold 84px \"Arial\"";
  v14.textAlign = 'center';
  v14.textBaseline = 'middle';
  createFrozenIceEffect(v14, v12, 800, 400, v15);
  addIceFacets(v14, v12, 800, 400);
  addFrostEffects(v14, 800, 400);
  drawFrozenBorder(v14, 800, 400);
  addSignature(v14, 800, 400);
  addWatermark(v14, 800, 400);
  return v13.toBuffer("image/png");
}
function drawFrozenBackground(v16, v17, v18) {
  const v19 = v16.createRadialGradient(v17 / 2, v18 / 2, 0, v17 / 2, v18 / 2, Math.max(v17, v18) / 1.5);
  v19.addColorStop(0, "#1a2a4a");
  v19.addColorStop(0.4, '#0a1a3a');
  v19.addColorStop(0.8, "#050a28");
  v19.addColorStop(1, "#000518");
  v16.fillStyle = v19;
  v16.fillRect(0, 0, v17, v18);
  v16.strokeStyle = "rgba(200, 230, 255, 0.1)";
  v16.lineWidth = 1;
  for (let v20 = 0; v20 < 50; v20++) {
    const v21 = Math.random() * v17;
    const v22 = Math.random() * v18;
    drawSnowflake(v16, v21, v22, 2 + Math.random() * 4);
  }
  v16.fillStyle = "rgba(180, 220, 255, 0.2)";
  for (let v23 = 0; v23 < 30; v23++) {
    const v24 = Math.random() * v17;
    const v25 = Math.random() * v18;
    const v26 = 1 + Math.random() * 3;
    drawIceCrystal(v16, v24, v25, v26);
  }
}
function createFrozenIceEffect(v27, v28, v29, v30, v31) {
  const v32 = v29 / 2;
  const v33 = v30 / 2;
  for (let v34 = 8; v34 > 0; v34--) {
    const v35 = v34 * 1.2;
    const v36 = 0.05 + v34 / 8 * 0.2;
    const v37 = 150 - v34 * 15;
    v27.fillStyle = "rgba(0, " + v37 + ", 255, " + v36 + ')';
    v27.fillText(v28.toUpperCase(), v32 + v35, v33 + v35);
  }
  v27.fillStyle = v31;
  v27.fillText(v28.toUpperCase(), v32, v33);
  v27.strokeStyle = "rgba(255, 255, 255, 0.6)";
  v27.lineWidth = 1.2;
  v27.strokeText(v28.toUpperCase(), v32, v33);
}
function addIceFacets(v38, v39, v40, v41) {
  const v42 = v40 / 2;
  const v43 = v41 / 2;
  const v44 = v38.measureText(v39.toUpperCase()).width;
  v38.save();
  v38.globalAlpha = 0.7;
  const v45 = [{
    'x': -0.3,
    'y': -0.3,
    'size': 0x4
  }, {
    'x': -0.15,
    'y': -0.4,
    'size': 0x5
  }, {
    'x': 0x0,
    'y': -0.35,
    'size': 0x3
  }, {
    'x': 0.15,
    'y': -0.4,
    'size': 0x4
  }, {
    'x': 0.3,
    'y': -0.3,
    'size': 0x3
  }, {
    'x': -0.25,
    'y': 0.2,
    'size': 0x2
  }, {
    'x': 0.2,
    'y': 0.25,
    'size': 0x2
  }];
  v45.forEach(v46 => {
    const v47 = v42 + v46.x * v44 / 2;
    const v48 = v43 + v46.y * 40;
    v38.fillStyle = "#FFFFFF";
    v38.beginPath();
    v38.arc(v47, v48, v46.size, 0, Math.PI * 2);
    v38.fill();
    v38.shadowColor = "rgba(180, 220, 255, 0.8)";
    v38.shadowBlur = 8;
    v38.fill();
  });
  v38.restore();
}
function addFrostEffects(v49, v50, v51) {
  v49.save();
  v49.globalAlpha = 0.8;
  for (let v52 = 0; v52 < 30; v52++) {
    const v53 = Math.random() * v50;
    const v54 = Math.random() * v51;
    const v55 = 1 + Math.random() * 2;
    v49.fillStyle = "#FFFFFF";
    v49.beginPath();
    v49.arc(v53, v54, v55, 0, Math.PI * 2);
    v49.fill();
  }
  const v56 = v49.createLinearGradient(0, v51 * 0.6, 0, v51);
  v56.addColorStop(0, "rgba(200, 230, 255, 0.3)");
  v56.addColorStop(1, "transparent");
  v49.fillStyle = v56;
  v49.fillRect(0, v51 * 0.6, v50, v51 * 0.4);
  v49.restore();
}
function drawFrozenBorder(v57, v58, v59) {
  const v60 = v57.createLinearGradient(0, 0, v58, v59);
  v60.addColorStop(0, "#A0D8FF");
  v60.addColorStop(0.5, '#78C8FF');
  v60.addColorStop(1, "#A0D8FF");
  v57.strokeStyle = v60;
  v57.lineWidth = 6;
  v57.shadowColor = "rgba(0, 150, 255, 0.4)";
  v57.shadowBlur = 15;
  v57.strokeRect(18, 18, v58 - 36, v59 - 36);
  v57.strokeStyle = "rgba(200, 230, 255, 0.4)";
  v57.lineWidth = 2;
  v57.shadowBlur = 0;
  v57.strokeRect(30, 30, v58 - 60, v59 - 60);
}
function drawSnowflake(v61, v62, v63, v64) {
  v61.save();
  v61.translate(v62, v63);
  for (let v65 = 0; v65 < 6; v65++) {
    v61.rotate(Math.PI / 3);
    v61.beginPath();
    v61.moveTo(0, 0);
    v61.lineTo(0, v64);
    v61.stroke();
    v61.beginPath();
    v61.moveTo(-v64 * 0.3, v64 * 0.3);
    v61.lineTo(v64 * 0.3, v64 * 0.7);
    v61.stroke();
  }
  v61.restore();
}
function drawIceCrystal(v66, v67, v68, v69) {
  v66.save();
  v66.translate(v67, v68);
  v66.beginPath();
  v66.moveTo(0, -v69);
  v66.lineTo(v69 * 0.7, 0);
  v66.lineTo(0, v69);
  v66.lineTo(-v69 * 0.7, 0);
  v66.closePath();
  v66.fill();
  v66.restore();
}
function addSignature(v70, v71, v72) {
  v70.save();
  const v73 = v71 - 120;
  const v74 = v72 - 20;
  v70.font = "italic 12px \"Arial\"";
  v70.fillStyle = "rgba(160, 200, 255, 0.7)";
  v70.textAlign = 'right';
  v70.textBaseline = "bottom";
  v70.fillText("by " + (config.botName || 'JuneX-Ultra'), v73, v74);
  v70.strokeStyle = "rgba(160, 200, 255, 0.4)";
  v70.lineWidth = 0.5;
  const v75 = v70.measureText("by " + (config.botName || 'JuneX-Ultra')).width;
  v70.beginPath();
  v70.moveTo(v73 - v75, v74 + 2);
  v70.lineTo(v73, v74 + 2);
  v70.stroke();
  v70.restore();
}
