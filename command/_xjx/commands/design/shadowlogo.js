const {
  createCanvas
} = require("@napi-rs/canvas");
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
  'name': "shadowlogo",
  'description': "Create logos with dramatic shadow and 3D effects",
  'category': 'design',
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (v7.length === 0) {
        await v5.sendMessage(v8, {
          'text': "👻 *SHADOW LOGO*\n\n*shadow*\nshadow <text>\n\n*Example:*\nshadow WOLF\nshadow SHADOW\nshadow DARK\n\n" + ("> Powered by " + (config.botName || "JuneX-Ultra"))
        }, {
          'quoted': v6
        });
        return;
      }
      const v9 = v7.join(" ").toUpperCase();
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
      const v10 = await generateShadowLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "👻 *Shadow Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || "JuneX-Ultra") + '_'
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
      console.error("❌ [SHADOWLOGO] ERROR:", v11);
      await v5.sendMessage(v8, {
        'react': {
          'text': '❌',
          'key': v6.key
        }
      })["catch"](() => {});
      await v5.sendMessage(v8, {
        'text': "❌ *ERROR*\n\n" + v11.message
      }, {
        'quoted': v6
      });
    }
  }
};
async function generateShadowLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  const v15 = v14.createLinearGradient(0, 0, 800, 400);
  v15.addColorStop(0, "#1a1a2e");
  v15.addColorStop(0.5, "#16213e");
  v15.addColorStop(1, "#0f3460");
  v14.fillStyle = v15;
  v14.fillRect(0, 0, 800, 400);
  addBackgroundTexture(v14, 800, 400);
  createShadowLayers(v14, v12, 800, 400);
  drawMainText(v14, v12, 800, 400);
  addShadowParticles(v14, 800, 400);
  addLightSource(v14, 800, 400);
  addWatermark(v14, 800, 400);
  return v13.toBuffer("image/png");
}
function addBackgroundTexture(v16, v17, v18) {
  v16.globalAlpha = 0.03;
  for (let v19 = 0; v19 < 2000; v19++) {
    const v20 = Math.random() * v17;
    const v21 = Math.random() * v18;
    const v22 = Math.random() * 2 + 0.5;
    v16.fillStyle = "#ffffff";
    v16.fillRect(v20, v21, v22, v22);
  }
  v16.globalAlpha = 1;
  const v23 = v16.createRadialGradient(v17 / 2, v18 / 2, 0, v17 / 2, v18 / 2, Math.max(v17, v18) / 2);
  v23.addColorStop(0, "transparent");
  v23.addColorStop(0.7, "transparent");
  v23.addColorStop(1, "rgba(0, 0, 0, 0.5)");
  v16.fillStyle = v23;
  v16.fillRect(0, 0, v17, v18);
}
function createShadowLayers(v24, v25, v26, v27) {
  const v28 = v26 / 2;
  const v29 = v27 / 2;
  for (let v30 = 15; v30 > 0; v30--) {
    const v31 = v30 / 15 * 20;
    const v32 = 0.1 + v30 / 15 * 0.3;
    v24.save();
    v24.translate(v28 + v31, v29 + v31);
    const v33 = 1 - v30 / 15;
    v24.fillStyle = "rgba(0, 0, 0, " + v32 * v33 + ')';
    v24.font = "bold 80px Arial";
    v24.textAlign = "center";
    v24.textBaseline = "middle";
    v24.fillText(v25, 0, 0);
    v24.restore();
  }
  v24.shadowColor = "rgba(0, 0, 0, 0.8)";
  v24.shadowBlur = 30;
  v24.shadowOffsetX = 15;
  v24.shadowOffsetY = 15;
  v24.fillStyle = "rgba(0, 0, 0, 0.6)";
  v24.font = "bold 80px Arial";
  v24.textAlign = "center";
  v24.textBaseline = "middle";
  v24.fillText(v25, v28 + 15, v29 + 15);
  v24.shadowColor = "transparent";
  v24.shadowBlur = 0;
  v24.shadowOffsetX = 0;
  v24.shadowOffsetY = 0;
}
function drawMainText(v34, v35, v36, v37) {
  const v38 = v36 / 2;
  const v39 = v37 / 2;
  v34.shadowColor = "rgba(255, 255, 255, 0.3)";
  v34.shadowBlur = 20;
  v34.shadowOffsetX = -2;
  v34.shadowOffsetY = -2;
  v34.fillStyle = "rgba(255, 255, 255, 0.1)";
  v34.font = "bold 80px Arial";
  v34.textAlign = "center";
  v34.textBaseline = "middle";
  v34.fillText(v35, v38 - 2, v39 - 2);
  const v40 = v34.createLinearGradient(v38 - 200, v39 - 50, v38 + 200, v39 + 50);
  v40.addColorStop(0, "#e0e0e0");
  v40.addColorStop(0.2, "#b8b8b8");
  v40.addColorStop(0.5, "#909090");
  v40.addColorStop(0.8, "#686868");
  v40.addColorStop(1, "#404040");
  v34.shadowColor = "transparent";
  v34.fillStyle = v40;
  v34.fillText(v35, v38, v39);
  const v41 = v34.createLinearGradient(v38 - 200, v39 - 50, v38 + 200, v39 - 30);
  v41.addColorStop(0, "rgba(255, 255, 255, 0.8)");
  v41.addColorStop(1, "rgba(255, 255, 255, 0.2)");
  v34.fillStyle = v41;
  v34.globalCompositeOperation = 'screen';
  v34.fillText(v35, v38, v39);
  v34.globalCompositeOperation = "source-over";
  v34.strokeStyle = "rgba(0, 0, 0, 0.5)";
  v34.lineWidth = 1;
  v34.strokeText(v35, v38, v39);
}
function addShadowParticles(v42, v43, v44) {
  v42.globalAlpha = 0.6;
  for (let v45 = 0; v45 < 8; v45++) {
    const v46 = Math.random() * v43;
    const v47 = Math.random() * v44;
    const v48 = Math.random() * 100 + 50;
    const v49 = v42.createRadialGradient(v46, v47, 0, v46, v47, v48);
    v49.addColorStop(0, "rgba(0, 0, 0, 0.8)");
    v49.addColorStop(1, "transparent");
    v42.fillStyle = v49;
    v42.beginPath();
    v42.arc(v46, v47, v48, 0, Math.PI * 2);
    v42.fill();
  }
  v42.fillStyle = "rgba(0, 0, 0, 0.4)";
  for (let v50 = 0; v50 < 50; v50++) {
    const v51 = Math.random() * v43;
    const v52 = Math.random() * v44;
    const v53 = Math.random() * 8 + 2;
    v42.beginPath();
    v42.arc(v51, v52, v53, 0, Math.PI * 2);
    v42.fill();
  }
  v42.globalAlpha = 1;
}
function addLightSource(v54, v55, v56) {
  const v57 = v55 * 0.3;
  const v58 = v56 * 0.3;
  const v59 = v54.createRadialGradient(v57, v58, 0, v57, v58, 200);
  v59.addColorStop(0, "rgba(255, 255, 255, 0.1)");
  v59.addColorStop(0.5, "rgba(255, 255, 255, 0.05)");
  v59.addColorStop(1, "transparent");
  v54.fillStyle = v59;
  v54.beginPath();
  v54.arc(v57, v58, 200, 0, Math.PI * 2);
  v54.fill();
  v54.strokeStyle = "rgba(255, 255, 255, 0.1)";
  v54.lineWidth = 1;
  for (let v60 = 0; v60 < 12; v60++) {
    const v61 = v60 / 12 * Math.PI * 2;
    v54.beginPath();
    v54.moveTo(v57, v58);
    v54.lineTo(v57 + Math.cos(v61) * 300, v58 + Math.sin(v61) * 300);
    v54.stroke();
  }
}
async function generateDeepShadowLogo(v62) {
  const v63 = createCanvas(800, 400);
  const v64 = v63.getContext('2d');
  v64.fillStyle = '#000000';
  v64.fillRect(0, 0, 800, 400);
  for (let v65 = 0; v65 < 25; v65++) {
    const v66 = v65 * 1.5;
    const v67 = 0.05 + v65 / 25 * 0.2;
    v64.fillStyle = "rgba(0, 0, 0, " + v67 + ')';
    v64.font = "bold 85px Arial";
    v64.textAlign = "center";
    v64.textBaseline = 'middle';
    v64.fillText(v62, 400 + v66, 200 + v66);
  }
  v64.shadowColor = "rgba(255, 255, 255, 0.1)";
  v64.shadowBlur = 15;
  v64.fillStyle = "#666666";
  v64.fillText(v62, 400, 200);
  return v63.toBuffer("image/png");
}
async function generateFloatingShadowLogo(v68) {
  const v69 = createCanvas(800, 400);
  const v70 = v69.getContext('2d');
  const v71 = v70.createLinearGradient(0, 0, 800, 400);
  v71.addColorStop(0, "#667eea");
  v71.addColorStop(1, "#764ba2");
  v70.fillStyle = v71;
  v70.fillRect(0, 0, 800, 400);
  v70.shadowColor = "rgba(0, 0, 0, 0.6)";
  v70.shadowBlur = 40;
  v70.shadowOffsetX = 0;
  v70.shadowOffsetY = 20;
  v70.fillStyle = "#2c3e50";
  v70.font = "bold 80px Arial";
  v70.textAlign = 'center';
  v70.textBaseline = 'middle';
  v70.fillText(v68, 400, 200);
  v70.shadowColor = 'transparent';
  const v72 = v70.createLinearGradient(200, 150, 600, 250);
  v72.addColorStop(0, "#ecf0f1");
  v72.addColorStop(1, "#bdc3c7");
  v70.fillStyle = v72;
  v70.fillText(v68, 400, 190);
  return v69.toBuffer("image/png");
}
