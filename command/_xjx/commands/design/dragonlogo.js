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
  v1.textBaseline = 'bottom';
  v1.fillStyle = "#FFFFFF";
  v1.strokeStyle = "#000000";
  v1.lineWidth = 2;
  v1.strokeText(v4, v2 / 2, v3 - 10);
  v1.fillText(v4, v2 / 2, v3 - 10);
  v1.restore();
}
module.exports = {
  'name': "dragonlogo",
  'description': "Create epic dragon text logos with fantasy and mystical effects",
  'category': 'design',
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (v7.length === 0) {
        await v5.sendMessage(v8, {
          'text': "🐉 *DRAGON LOGO*\n\n*dragonlogo*\ndragonlogo <text>\n\n*Example:*\ndragonlogo DRAGON\ndragonlogo FIRE\ndragonlogo WYVERN\n\n" + ("> Powered by " + (config.botName || "JuneX-Ultra"))
        }, {
          'quoted': v6
        });
        return;
      }
      const v9 = v7.join(" ");
      if (v9.length > 10) {
        await v5.sendMessage(v8, {
          'text': "❌ *ERROR*\n\nText too long!\nMaximum 10 characters\nYour text: \"" + v9 + "\" (" + v9.length + " chars)"
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
      const v10 = await generateDragonLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "🐉 *Dragon Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || "JuneX-Ultra") + '_'
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
      console.error("❌ [DRAGONLOGO] ERROR:", v11);
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
async function generateDragonLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  createMysticalBackground(v14, 800, 400);
  drawEpicDragon(v14, 560, 160);
  addDragonFire(v14, 560, 160);
  addDragonScales(v14, 560, 160);
  addDragonWings(v14, 560, 160);
  drawDragonText(v14, v12, 800, 400);
  addMagicRunes(v14, 800, 400);
  addMysticalParticles(v14, 800, 400);
  addTreasurePile(v14, 800, 400);
  addFantasyElements(v14, 800, 400);
  drawDragonBorder(v14, 800, 400);
  addDragonSignature(v14, 800, 400);
  addWatermark(v14, 800, 400);
  return v13.toBuffer('image/png');
}
function createMysticalBackground(v15, v16, v17) {
  const v18 = v15.createLinearGradient(0, 0, 0, v17);
  v18.addColorStop(0, '#1a0a2a');
  v18.addColorStop(0.3, "#2d1b4e");
  v18.addColorStop(0.6, '#4a2c7a');
  v18.addColorStop(1, '#1a0a2a');
  v15.fillStyle = v18;
  v15.fillRect(0, 0, v16, v17);
  addMysticalMist(v15, v16, v17);
  addAncientRuins(v15, v16, v17);
}
function addMysticalMist(v19, v20, v21) {
  v19.save();
  v19.globalAlpha = 0.3;
  v19.globalCompositeOperation = "screen";
  const v22 = [{
    'x': v20 * 0.2,
    'y': v21 * 0.3,
    'size': 0x78,
    'color': [100, 50, 200]
  }, {
    'x': v20 * 0.7,
    'y': v21 * 0.2,
    'size': 0x64,
    'color': [200, 50, 100]
  }, {
    'x': v20 * 0.4,
    'y': v21 * 0.6,
    'size': 0x6e,
    'color': [50, 150, 200]
  }, {
    'x': v20 * 0.8,
    'y': v21 * 0.7,
    'size': 0x5a,
    'color': [200, 150, 50]
  }];
  v22.forEach(v23 => {
    const [v24, v25, v26] = v23.color;
    const v27 = v19.createRadialGradient(v23.x, v23.y, 0, v23.x, v23.y, v23.size);
    v27.addColorStop(0, "rgba(" + v24 + ", " + v25 + ", " + v26 + ", 0.6)");
    v27.addColorStop(1, "transparent");
    v19.fillStyle = v27;
    v19.beginPath();
    v19.arc(v23.x, v23.y, v23.size, 0, Math.PI * 2);
    v19.fill();
  });
  v19.restore();
}
function addAncientRuins(v28, v29, v30) {
  v28.save();
  v28.globalAlpha = 0.2;
  v28.strokeStyle = "rgba(150, 150, 200, 0.4)";
  v28.lineWidth = 2;
  for (let v31 = 0; v31 < 5; v31++) {
    const v32 = v29 * 0.1 + v31 * 80;
    const v33 = v30 * 0.6;
    const v34 = 80 + Math.random() * 40;
    v28.beginPath();
    v28.moveTo(v32, v33);
    v28.lineTo(v32, v33 - v34);
    v28.stroke();
    v28.beginPath();
    v28.arc(v32, v33 - v34, 8, 0, Math.PI * 2);
    v28.stroke();
  }
  v28.beginPath();
  v28.moveTo(v29 * 0.6, v30 * 0.7);
  v28.quadraticCurveTo(v29 * 0.7, v30 * 0.5, v29 * 0.8, v30 * 0.7);
  v28.stroke();
  v28.restore();
}
function drawEpicDragon(v35, v36, v37) {
  v35.save();
  const v38 = v35.createLinearGradient(v36 - 50, v37, v36 + 50, v37);
  v38.addColorStop(0, "#8B0000");
  v38.addColorStop(0.5, '#B22222');
  v38.addColorStop(1, "#DC143C");
  v35.strokeStyle = v38;
  v35.lineWidth = 15;
  v35.lineCap = 'round';
  v35.lineJoin = "round";
  v35.beginPath();
  v35.moveTo(v36 - 80, v37 + 20);
  v35.bezierCurveTo(v36 - 40, v37 - 30, v36 + 20, v37 - 20, v36 + 60, v37 + 10);
  v35.stroke();
  v35.beginPath();
  v35.moveTo(v36 + 60, v37 + 10);
  v35.bezierCurveTo(v36 + 80, v37 - 10, v36 + 100, v37 - 5, v36 + 110, v37 + 15);
  v35.stroke();
  drawDragonHead(v35, v36 + 110, v37 + 15);
  drawDragonLegs(v35, v36, v37);
  drawDragonTail(v35, v36 - 80, v37 + 20);
  v35.restore();
}
function drawDragonHead(v39, v40, v41) {
  v39.fillStyle = "#B22222";
  v39.beginPath();
  v39.ellipse(v40, v41, 20, 15, 0, 0, Math.PI * 2);
  v39.fill();
  v39.fillStyle = "#8B0000";
  v39.beginPath();
  v39.ellipse(v40 + 15, v41, 10, 8, 0, 0, Math.PI * 2);
  v39.fill();
  v39.strokeStyle = '#FFD700';
  v39.lineWidth = 3;
  v39.lineCap = "round";
  v39.beginPath();
  v39.moveTo(v40 - 5, v41 - 12);
  v39.lineTo(v40 - 15, v41 - 25);
  v39.stroke();
  v39.beginPath();
  v39.moveTo(v40 + 5, v41 - 12);
  v39.lineTo(v40 + 15, v41 - 25);
  v39.stroke();
  v39.fillStyle = '#FF4500';
  v39.beginPath();
  v39.arc(v40 - 5, v41 - 5, 4, 0, Math.PI * 2);
  v39.fill();
  v39.fillStyle = "#FFFF00";
  v39.beginPath();
  v39.arc(v40 - 5, v41 - 5, 2, 0, Math.PI * 2);
  v39.fill();
  v39.fillStyle = "#8B0000";
  v39.beginPath();
  v39.arc(v40 + 20, v41 - 2, 2, 0, Math.PI * 2);
  v39.fill();
  v39.beginPath();
  v39.arc(v40 + 20, v41 + 2, 2, 0, Math.PI * 2);
  v39.fill();
}
function drawDragonLegs(v42, v43, v44) {
  v42.strokeStyle = "#B22222";
  v42.lineWidth = 8;
  v42.lineCap = "round";
  v42.beginPath();
  v42.moveTo(v43 + 20, v44 + 5);
  v42.lineTo(v43 + 25, v44 + 30);
  v42.stroke();
  v42.beginPath();
  v42.moveTo(v43 + 40, v44 + 8);
  v42.lineTo(v43 + 45, v44 + 35);
  v42.stroke();
  v42.beginPath();
  v42.moveTo(v43 - 40, v44 + 15);
  v42.lineTo(v43 - 35, v44 + 40);
  v42.stroke();
  v42.beginPath();
  v42.moveTo(v43 - 20, v44 + 18);
  v42.lineTo(v43 - 15, v44 + 45);
  v42.stroke();
  v42.strokeStyle = "#FFD700";
  v42.lineWidth = 2;
  const v45 = [{
    'x': v43 + 25,
    'y': v44 + 30
  }, {
    'x': v43 + 45,
    'y': v44 + 35
  }, {
    'x': v43 - 35,
    'y': v44 + 40
  }, {
    'x': v43 - 15,
    'y': v44 + 45
  }];
  v45.forEach(v46 => {
    for (let v47 = 0; v47 < 3; v47++) {
      const v48 = -0.5 + v47 * 0.5;
      v42.beginPath();
      v42.moveTo(v46.x, v46.y);
      v42.lineTo(v46.x + Math.cos(v48) * 8, v46.y + Math.sin(v48) * 8);
      v42.stroke();
    }
  });
}
function drawDragonTail(v49, v50, v51) {
  v49.strokeStyle = "#B22222";
  v49.lineWidth = 12;
  v49.lineCap = "round";
  v49.beginPath();
  v49.moveTo(v50, v51);
  v49.bezierCurveTo(v50 - 40, v51 + 20, v50 - 60, v51 - 10, v50 - 80, v51 + 5);
  v49.stroke();
  v49.strokeStyle = "#FFD700";
  v49.lineWidth = 4;
  v49.beginPath();
  v49.moveTo(v50 - 80, v51 + 5);
  v49.lineTo(v50 - 95, v51 - 5);
  v49.stroke();
}
function addDragonWings(v52, v53, v54) {
  v52.save();
  v52.globalAlpha = 0.8;
  const v55 = v52.createLinearGradient(v53 - 10, v54 - 20, v53 - 60, v54 - 50);
  v55.addColorStop(0, "rgba(139, 0, 0, 0.9)");
  v55.addColorStop(1, "rgba(178, 34, 34, 0.6)");
  v52.fillStyle = v55;
  v52.beginPath();
  v52.moveTo(v53 - 10, v54 - 20);
  v52.lineTo(v53 - 40, v54 - 60);
  v52.lineTo(v53 - 60, v54 - 30);
  v52.lineTo(v53 - 30, v54 - 10);
  v52.closePath();
  v52.fill();
  v52.strokeStyle = "rgba(160, 40, 40, 0.8)";
  v52.lineWidth = 2;
  v52.beginPath();
  v52.moveTo(v53 - 10, v54 - 20);
  v52.lineTo(v53 - 35, v54 - 45);
  v52.stroke();
  v52.beginPath();
  v52.moveTo(v53 - 15, v54 - 18);
  v52.lineTo(v53 - 45, v54 - 35);
  v52.stroke();
  v52.fillStyle = v55;
  v52.beginPath();
  v52.moveTo(v53 + 5, v54 - 15);
  v52.lineTo(v53 + 25, v54 - 55);
  v52.lineTo(v53 + 45, v54 - 25);
  v52.lineTo(v53 + 20, v54 - 5);
  v52.closePath();
  v52.fill();
  v52.restore();
}
function addDragonScales(v56, v57, v58) {
  v56.save();
  v56.globalAlpha = 0.7;
  const v59 = [{
    'x': v57 - 60,
    'y': v58 + 5
  }, {
    'x': v57 - 40,
    'y': v58 - 5
  }, {
    'x': v57 - 20,
    'y': v58 + 8
  }, {
    'x': v57,
    'y': v58 - 2
  }, {
    'x': v57 + 20,
    'y': v58 + 6
  }, {
    'x': v57 + 40,
    'y': v58 - 3
  }];
  v59.forEach(v60 => {
    v56.fillStyle = "#FF8C00";
    v56.beginPath();
    v56.ellipse(v60.x, v60.y, 6, 4, 0, 0, Math.PI * 2);
    v56.fill();
    v56.fillStyle = "#FFD700";
    v56.beginPath();
    v56.ellipse(v60.x - 2, v60.y - 1, 2, 1, 0, 0, Math.PI * 2);
    v56.fill();
  });
  v56.restore();
}
function addDragonFire(v61, v62, v63) {
  v61.save();
  v61.globalCompositeOperation = "screen";
  const v64 = v62 + 120;
  const v65 = v63 + 10;
  const v66 = v61.createLinearGradient(v64, v65, v64 - 100, v65);
  v66.addColorStop(0, '#FFFF00');
  v66.addColorStop(0.3, "#FF4500");
  v66.addColorStop(0.7, "#DC143C");
  v66.addColorStop(1, "#8B0000");
  v61.strokeStyle = v66;
  v61.lineWidth = 12;
  v61.lineCap = "round";
  v61.beginPath();
  v61.moveTo(v64, v65);
  v61.bezierCurveTo(v64 - 50, v65 - 20, v64 - 80, v65 + 10, v64 - 120, v65 - 5);
  v61.stroke();
  for (let v67 = 0; v67 < 3; v67++) {
    const v68 = (Math.random() - 0.5) * 30;
    v61.beginPath();
    v61.moveTo(v64, v65);
    v61.bezierCurveTo(v64 - 40, v65 - 15 + v68, v64 - 70, v65 + 5 + v68, v64 - 100, v65 - 10 + v68);
    v61.stroke();
  }
  v61.strokeStyle = "rgba(255, 200, 0, 0.4)";
  v61.lineWidth = 25;
  v61.beginPath();
  v61.moveTo(v64, v65);
  v61.bezierCurveTo(v64 - 50, v65 - 20, v64 - 80, v65 + 10, v64 - 120, v65 - 5);
  v61.stroke();
  addFireSparks(v61, v64 - 60, v65);
  v61.restore();
}
function addFireSparks(v69, v70, v71) {
  v69.save();
  v69.globalCompositeOperation = "screen";
  for (let v72 = 0; v72 < 15; v72++) {
    const v73 = v70 + (Math.random() - 0.5) * 80;
    const v74 = v71 + (Math.random() - 0.5) * 40;
    const v75 = 1 + Math.random() * 4;
    const v76 = 0.3 + Math.random() * 0.7;
    v69.fillStyle = "rgba(255, 255, 200, " + v76 + ')';
    v69.beginPath();
    v69.arc(v73, v74, v75, 0, Math.PI * 2);
    v69.fill();
    const v77 = 5 + Math.random() * 10;
    const v78 = Math.random() * Math.PI * 2;
    v69.strokeStyle = "rgba(255, 200, 100, " + v76 * 0.5 + ')';
    v69.lineWidth = v75 * 0.5;
    v69.lineCap = "round";
    v69.beginPath();
    v69.moveTo(v73, v74);
    v69.lineTo(v73 + Math.cos(v78) * v77, v74 + Math.sin(v78) * v77);
    v69.stroke();
  }
  v69.restore();
}
function drawDragonText(v79, v80, v81, v82) {
  const v83 = v81 * 0.35;
  const v84 = v82 * 0.6;
  v79.save();
  v79.shadowColor = "rgba(0, 0, 0, 0.7)";
  v79.shadowBlur = 15;
  v79.shadowOffsetX = 5;
  v79.shadowOffsetY = 5;
  const v85 = v79.createLinearGradient(v83 - 100, v84 - 50, v83 + 100, v84 + 50);
  v85.addColorStop(0, '#FFD700');
  v85.addColorStop(0.3, "#FF8C00");
  v85.addColorStop(0.7, '#B22222');
  v85.addColorStop(1, "#8B0000");
  v79.font = "bold 68px \"Arial\"";
  v79.textAlign = "center";
  v79.textBaseline = 'middle';
  v79.fillStyle = v85;
  v79.fillText(v80.toUpperCase(), v83, v84);
  v79.shadowColor = "transparent";
  v79.shadowBlur = 0;
  v79.shadowOffsetX = 0;
  v79.shadowOffsetY = 0;
  v79.strokeStyle = "rgba(255, 215, 0, 0.8)";
  v79.lineWidth = 3;
  v79.strokeText(v80.toUpperCase(), v83, v84);
  addTextScaleTexture(v79, v80, v83, v84);
  v79.restore();
}
function addTextScaleTexture(v86, v87, v88, v89) {
  v86.save();
  v86.globalCompositeOperation = "overlay";
  v86.globalAlpha = 0.3;
  const v90 = v86.measureText(v87.toUpperCase());
  const v91 = v90.width;
  for (let v92 = v88 - v91 / 2; v92 < v88 + v91 / 2; v92 += 12) {
    for (let v93 = v89 - 34; v93 < v89 + 34; v93 += 10) {
      if (Math.random() > 0.7) {
        v86.fillStyle = "rgba(255, 215, 0, 0.4)";
        v86.beginPath();
        v86.ellipse(v92, v93, 4, 2, 0, 0, Math.PI * 2);
        v86.fill();
      }
    }
  }
  v86.restore();
}
function addMagicRunes(v94, v95, v96) {
  v94.save();
  v94.globalAlpha = 0.6;
  v94.strokeStyle = "rgba(100, 200, 255, 0.8)";
  v94.lineWidth = 2;
  const v97 = [{
    'x': v95 * 0.2,
    'y': v96 * 0.3
  }, {
    'x': v95 * 0.8,
    'y': v96 * 0.2
  }, {
    'x': v95 * 0.3,
    'y': v96 * 0.8
  }, {
    'x': v95 * 0.7,
    'y': v96 * 0.7
  }];
  v97.forEach(v98 => {
    v94.beginPath();
    v94.arc(v98.x, v98.y, 15, 0, Math.PI * 2);
    v94.stroke();
    v94.beginPath();
    v94.moveTo(v98.x - 8, v98.y - 8);
    v94.lineTo(v98.x + 8, v98.y + 8);
    v94.stroke();
    v94.beginPath();
    v94.moveTo(v98.x + 8, v98.y - 8);
    v94.lineTo(v98.x - 8, v98.y + 8);
    v94.stroke();
    v94.strokeStyle = "rgba(150, 220, 255, 0.4)";
    v94.lineWidth = 8;
    v94.beginPath();
    v94.arc(v98.x, v98.y, 20, 0, Math.PI * 2);
    v94.stroke();
    v94.strokeStyle = "rgba(100, 200, 255, 0.8)";
    v94.lineWidth = 2;
  });
  v94.restore();
}
function addMysticalParticles(v99, v100, v101) {
  v99.save();
  v99.globalCompositeOperation = 'screen';
  for (let v102 = 0; v102 < 40; v102++) {
    const v103 = Math.random() * v100;
    const v104 = Math.random() * v101;
    const v105 = 1 + Math.random() * 4;
    const v106 = 200 + Math.random() * 160;
    v99.fillStyle = "hsla(" + v106 + ", 100%, 70%, 0.7)";
    v99.beginPath();
    v99.arc(v103, v104, v105, 0, Math.PI * 2);
    v99.fill();
    v99.fillStyle = "hsla(" + v106 + ", 100%, 70%, 0.3)";
    v99.beginPath();
    v99.arc(v103, v104, v105 * 2, 0, Math.PI * 2);
    v99.fill();
  }
  v99.restore();
}
function addTreasurePile(v107, v108, v109) {
  v107.save();
  v107.globalAlpha = 0.8;
  const v110 = v108 * 0.2;
  const v111 = v109 * 0.8;
  for (let v112 = 0; v112 < 20; v112++) {
    const v113 = v110 + (Math.random() - 0.5) * 60;
    const v114 = v111 + (Math.random() - 0.5) * 30;
    const v115 = 3 + Math.random() * 5;
    v107.fillStyle = "#FFD700";
    v107.beginPath();
    v107.arc(v113, v114, v115, 0, Math.PI * 2);
    v107.fill();
    v107.fillStyle = "#FFFF00";
    v107.beginPath();
    v107.arc(v113 - v115 * 0.3, v114 - v115 * 0.3, v115 * 0.5, 0, Math.PI * 2);
    v107.fill();
  }
  const v116 = ["#FF0000", "#00FF00", '#0000FF', '#FF00FF'];
  for (let v117 = 0; v117 < 5; v117++) {
    const v118 = v110 + (Math.random() - 0.5) * 50;
    const v119 = v111 + (Math.random() - 0.5) * 20;
    const v120 = 4 + Math.random() * 3;
    const v121 = v116[Math.floor(Math.random() * v116.length)];
    v107.fillStyle = v121;
    v107.beginPath();
    v107.moveTo(v118, v119 - v120);
    v107.lineTo(v118 + v120, v119);
    v107.lineTo(v118, v119 + v120);
    v107.lineTo(v118 - v120, v119);
    v107.closePath();
    v107.fill();
    v107.fillStyle = "#FFFFFF";
    v107.beginPath();
    v107.moveTo(v118 - v120 * 0.3, v119 - v120 * 0.3);
    v107.lineTo(v118, v119 - v120 * 0.1);
    v107.lineTo(v118 - v120 * 0.1, v119);
    v107.closePath();
    v107.fill();
  }
  v107.restore();
}
function addFantasyElements(v122, v123, v124) {
  v122.save();
  v122.globalAlpha = 0.4;
  v122.strokeStyle = "rgba(100, 100, 150, 0.6)";
  v122.lineWidth = 3;
  for (let v125 = 0; v125 < 5; v125++) {
    const v126 = v125 * 60;
    const v127 = 30 + Math.random() * 20;
    v122.beginPath();
    v122.moveTo(v126, v124 * 0.7);
    v122.lineTo(v126 + 30, v124 * 0.7 - v127);
    v122.lineTo(v126 + 60, v124 * 0.7);
    v122.stroke();
  }
  v122.restore();
}
function drawDragonBorder(v128, v129, v130) {
  v128.save();
  const v131 = v128.createLinearGradient(0, 0, v129, 0);
  v131.addColorStop(0, '#8B0000');
  v131.addColorStop(0.3, "#B22222");
  v131.addColorStop(0.5, "#FF8C00");
  v131.addColorStop(0.7, "#B22222");
  v131.addColorStop(1, '#8B0000');
  v128.strokeStyle = v131;
  v128.lineWidth = 10;
  v128.shadowColor = "rgba(255, 100, 0, 0.6)";
  v128.shadowBlur = 20;
  v128.strokeRect(10, 10, v129 - 20, v130 - 20);
  v128.strokeStyle = "rgba(255, 215, 0, 0.6)";
  v128.lineWidth = 3;
  v128.shadowBlur = 15;
  v128.strokeRect(20, 20, v129 - 40, v130 - 40);
  addDragonClawMarks(v128, v129, v130);
  v128.restore();
}
function addDragonClawMarks(v132, v133, v134) {
  v132.save();
  v132.strokeStyle = "rgba(255, 215, 0, 0.8)";
  v132.lineWidth = 2;
  v132.lineCap = "round";
  const v135 = [{
    'x': 0x19,
    'y': 0x19
  }, {
    'x': v133 - 25,
    'y': 0x19
  }, {
    'x': 0x19,
    'y': v134 - 25
  }, {
    'x': v133 - 25,
    'y': v134 - 25
  }];
  v135.forEach(v136 => {
    for (let v137 = 0; v137 < 3; v137++) {
      const v138 = -0.3 + v137 * 0.3;
      v132.beginPath();
      v132.moveTo(v136.x, v136.y);
      v132.lineTo(v136.x + Math.cos(v138) * 15, v136.y + Math.sin(v138) * 15);
      v132.stroke();
    }
  });
  v132.restore();
}
function addDragonSignature(v139, v140, v141) {
  v139.save();
  const v142 = v140 - 110;
  const v143 = v141 - 25;
  v139.font = "italic 14px \"Arial\"";
  v139.fillStyle = "rgba(255, 215, 0, 0.9)";
  v139.textAlign = "right";
  v139.textBaseline = "bottom";
  v139.shadowColor = "rgba(255, 100, 0, 0.6)";
  v139.shadowBlur = 10;
  v139.fillText("by " + (config.botName || "JuneX-Ultra"), v142, v143);
  v139.fillStyle = "#FF8C00";
  v139.beginPath();
  v139.ellipse(v142 + 5, v143 - 8, 6, 3, 0, 0, Math.PI * 2);
  v139.fill();
  v139.fillStyle = "#FFD700";
  v139.beginPath();
  v139.ellipse(v142 + 3, v143 - 9, 2, 1, 0, 0, Math.PI * 2);
  v139.fill();
  v139.restore();
}
