const {
  createCanvas
} = require("@napi-rs/canvas");
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
  v1.textBaseline = "bottom";
  v1.fillStyle = "#FFFFFF";
  v1.strokeStyle = '#000000';
  v1.lineWidth = 2;
  v1.strokeText(v4, v2 / 2, v3 - 10);
  v1.fillText(v4, v2 / 2, v3 - 10);
  v1.restore();
}
module.exports = {
  'name': "phoenixlogo",
  'description': "Create magnificent phoenix text logos with fire, rebirth and mystical effects",
  'category': 'design',
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (v7.length === 0) {
        await v5.sendMessage(v8, {
          'text': "🔥 *PHOENIX LOGO*\n\n*phoenix*\nphoenix <text>\n\n*Example:*\nphoenix PHOENIX\nphoenix REBIRTH\nphoenix FIREBIRD\n\n" + ("> Powered by " + (config.botName || "JuneX-Ultra"))
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
      const v10 = await generatePhoenixLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "🔥 *Phoenix Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || "JuneX-Ultra") + '_'
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
      console.error("❌ [PHOENIXLOGO] ERROR:", v11);
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
async function generatePhoenixLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  createPhoenixSky(v14, 800, 400);
  drawMajesticPhoenix(v14, 600, 200);
  addPhoenixFireAura(v14, 600, 200);
  addFlamingWings(v14, 600, 200);
  addFireTail(v14, 600, 200);
  drawRebirthText(v14, v12, 800, 400);
  addAshesParticles(v14, 800, 400);
  addRebirthParticles(v14, 800, 400);
  addFloatingEmbers(v14, 800, 400);
  addFireTrails(v14, 800, 400);
  addMysticalEnergy(v14, 800, 400);
  addNebulaBackground(v14, 800, 400);
  drawPhoenixBorder(v14, 800, 400);
  addPhoenixSignature(v14, 800, 400);
  addWatermark(v14, 800, 400);
  return v13.toBuffer('image/png');
}
function createPhoenixSky(v15, v16, v17) {
  const v18 = v15.createLinearGradient(0, 0, 0, v17);
  v18.addColorStop(0, "#8B0000");
  v18.addColorStop(0.2, "#FF4500");
  v18.addColorStop(0.4, '#FF8C00');
  v18.addColorStop(0.6, "#FFD700");
  v18.addColorStop(0.8, "#FF6347");
  v18.addColorStop(1, "#DC143C");
  v15.fillStyle = v18;
  v15.fillRect(0, 0, v16, v17);
  addFireClouds(v15, v16, v17);
}
function addFireClouds(v19, v20, v21) {
  v19.save();
  v19.globalAlpha = 0.4;
  v19.globalCompositeOperation = 'screen';
  const v22 = [{
    'x': v20 * 0.2,
    'y': v21 * 0.3,
    'size': 0x64,
    'color': [255, 100, 0]
  }, {
    'x': v20 * 0.7,
    'y': v21 * 0.2,
    'size': 0x50,
    'color': [255, 150, 0]
  }, {
    'x': v20 * 0.3,
    'y': v21 * 0.7,
    'size': 0x78,
    'color': [255, 200, 0]
  }, {
    'x': v20 * 0.8,
    'y': v21 * 0.6,
    'size': 0x5a,
    'color': [255, 100, 50]
  }];
  v22.forEach(v23 => {
    const [v24, v25, v26] = v23.color;
    const v27 = v19.createRadialGradient(v23.x, v23.y, 0, v23.x, v23.y, v23.size);
    v27.addColorStop(0, 'rgba(' + v24 + ", " + v25 + ", " + v26 + ", 0.7)");
    v27.addColorStop(1, "transparent");
    v19.fillStyle = v27;
    v19.beginPath();
    v19.arc(v23.x, v23.y, v23.size, 0, Math.PI * 2);
    v19.fill();
  });
  v19.restore();
}
function drawMajesticPhoenix(v28, v29, v30) {
  v28.save();
  const v31 = v28.createRadialGradient(v29, v30, 0, v29, v30, 60);
  v31.addColorStop(0, "rgba(255, 255, 200, 0.9)");
  v31.addColorStop(0.5, "rgba(255, 200, 100, 0.6)");
  v31.addColorStop(1, "rgba(255, 150, 50, 0.3)");
  v28.fillStyle = v31;
  v28.beginPath();
  v28.arc(v29, v30, 60, 0, Math.PI * 2);
  v28.fill();
  const v32 = v28.createRadialGradient(v29 - 10, v30 - 10, 0, v29, v30, 25);
  v32.addColorStop(0, "#FFFF00");
  v32.addColorStop(0.3, "#FFD700");
  v32.addColorStop(0.7, "#FF8C00");
  v32.addColorStop(1, "#FF4500");
  v28.fillStyle = v32;
  v28.beginPath();
  v28.arc(v29, v30, 25, 0, Math.PI * 2);
  v28.fill();
  drawPhoenixHead(v28, v29, v30);
  drawPhoenixLegs(v28, v29, v30);
  v28.restore();
}
function drawPhoenixHead(v33, v34, v35) {
  const v36 = v33.createLinearGradient(v34, v35 - 15, v34 + 35, v35 - 40);
  v36.addColorStop(0, "#FFD700");
  v36.addColorStop(1, "#FF8C00");
  v33.strokeStyle = v36;
  v33.lineWidth = 8;
  v33.lineCap = 'round';
  v33.beginPath();
  v33.moveTo(v34, v35 - 15);
  v33.lineTo(v34 + 35, v35 - 40);
  v33.stroke();
  v33.fillStyle = "#FF8C00";
  v33.beginPath();
  v33.arc(v34 + 40, v35 - 45, 12, 0, Math.PI * 2);
  v33.fill();
  const v37 = ["#FFFF00", "#FFD700", "#FF8C00"];
  v37.forEach((v38, v39) => {
    const v40 = -0.5 + v39 * 0.5;
    const v41 = 15 + v39 * 5;
    v33.strokeStyle = v38;
    v33.lineWidth = 4 - v39;
    v33.lineCap = "round";
    v33.beginPath();
    v33.moveTo(v34 + 40, v35 - 45);
    v33.lineTo(v34 + 40 + Math.cos(v40) * v41, v35 - 45 + Math.sin(v40) * v41);
    v33.stroke();
  });
  v33.fillStyle = "#FF4500";
  v33.beginPath();
  v33.arc(v34 + 45, v35 - 47, 3, 0, Math.PI * 2);
  v33.fill();
  v33.fillStyle = "#FFFF00";
  v33.beginPath();
  v33.arc(v34 + 46, v35 - 48, 1, 0, Math.PI * 2);
  v33.fill();
  v33.strokeStyle = "#FF6347";
  v33.lineWidth = 3;
  v33.lineCap = "round";
  v33.beginPath();
  v33.moveTo(v34 + 48, v35 - 43);
  v33.lineTo(v34 + 55, v35 - 45);
  v33.stroke();
}
function drawPhoenixLegs(v42, v43, v44) {
  v42.strokeStyle = "#FF8C00";
  v42.lineWidth = 4;
  v42.lineCap = 'round';
  v42.beginPath();
  v42.moveTo(v43 + 5, v44 + 20);
  v42.lineTo(v43 + 10, v44 + 35);
  v42.stroke();
  v42.beginPath();
  v42.moveTo(v43 - 5, v44 + 25);
  v42.lineTo(v43 - 8, v44 + 40);
  v42.stroke();
  v42.strokeStyle = "#FF6347";
  v42.lineWidth = 2;
  const v45 = [{
    'x': v43 + 10,
    'y': v44 + 35
  }, {
    'x': v43 - 8,
    'y': v44 + 40
  }];
  v45.forEach(v46 => {
    for (let v47 = 0; v47 < 3; v47++) {
      const v48 = -0.3 + v47 * 0.3;
      v42.beginPath();
      v42.moveTo(v46.x, v46.y);
      v42.lineTo(v46.x + Math.cos(v48) * 8, v46.y + Math.sin(v48) * 8);
      v42.stroke();
    }
  });
}
function addPhoenixFireAura(v49, v50, v51) {
  v49.save();
  v49.globalCompositeOperation = "screen";
  const v52 = [{
    'size': 0x78,
    'alpha': 0.4,
    'color': [255, 255, 200]
  }, {
    'size': 0x5a,
    'alpha': 0.6,
    'color': [255, 200, 100]
  }, {
    'size': 0x3c,
    'alpha': 0.8,
    'color': [255, 150, 50]
  }];
  v52.forEach(v53 => {
    const [v54, v55, v56] = v53.color;
    const v57 = v49.createRadialGradient(v50, v51, 0, v50, v51, v53.size);
    v57.addColorStop(0, 'rgba(' + v54 + ", " + v55 + ", " + v56 + ", " + v53.alpha + ')');
    v57.addColorStop(1, "transparent");
    v49.fillStyle = v57;
    v49.beginPath();
    v49.arc(v50, v51, v53.size, 0, Math.PI * 2);
    v49.fill();
  });
  for (let v58 = 0; v58 < 3; v58++) {
    const v59 = 150 + v58 * 30;
    const v60 = 0.2 - v58 * 0.05;
    v49.strokeStyle = "rgba(255, 200, 100, " + v60 + ')';
    v49.lineWidth = 8;
    v49.beginPath();
    v49.arc(v50, v51, v59, 0, Math.PI * 2);
    v49.stroke();
  }
  v49.restore();
}
function addFlamingWings(v61, v62, v63) {
  v61.save();
  v61.globalCompositeOperation = "screen";
  v61.globalAlpha = 0.8;
  const v64 = v61.createLinearGradient(v62 - 20, v63 - 10, v62 - 80, v63 - 50);
  v64.addColorStop(0, "#FFFF00");
  v64.addColorStop(0.3, "#FFD700");
  v64.addColorStop(0.7, "#FF8C00");
  v64.addColorStop(1, '#FF4500');
  v61.fillStyle = v64;
  v61.beginPath();
  v61.moveTo(v62 - 20, v63 - 10);
  v61.bezierCurveTo(v62 - 40, v63 - 60, v62 - 70, v63 - 30, v62 - 80, v63 - 10);
  v61.bezierCurveTo(v62 - 70, v63 + 10, v62 - 40, v63 - 5, v62 - 20, v63 - 10);
  v61.closePath();
  v61.fill();
  const v65 = v61.createLinearGradient(v62 + 20, v63 - 10, v62 + 80, v63 - 50);
  v65.addColorStop(0, "#FFFF00");
  v65.addColorStop(0.3, "#FFD700");
  v65.addColorStop(0.7, "#FF8C00");
  v65.addColorStop(1, "#FF4500");
  v61.fillStyle = v65;
  v61.beginPath();
  v61.moveTo(v62 + 20, v63 - 10);
  v61.bezierCurveTo(v62 + 40, v63 - 60, v62 + 70, v63 - 30, v62 + 80, v63 - 10);
  v61.bezierCurveTo(v62 + 70, v63 + 10, v62 + 40, v63 - 5, v62 + 20, v63 - 10);
  v61.closePath();
  v61.fill();
  addWingFlames(v61, v62, v63);
  v61.restore();
}
function addWingFlames(v66, v67, v68) {
  v66.strokeStyle = "rgba(255, 255, 200, 0.8)";
  v66.lineWidth = 3;
  v66.lineCap = "round";
  const v69 = [{
    'start': {
      'x': v67 - 30,
      'y': v68 - 25
    },
    'end': {
      'x': v67 - 50,
      'y': v68 - 45
    }
  }, {
    'start': {
      'x': v67 - 40,
      'y': v68 - 15
    },
    'end': {
      'x': v67 - 65,
      'y': v68 - 25
    }
  }, {
    'start': {
      'x': v67 - 50,
      'y': v68 - 5
    },
    'end': {
      'x': v67 - 75,
      'y': v68 - 10
    }
  }];
  v69.forEach(v70 => {
    v66.beginPath();
    v66.moveTo(v70.start.x, v70.start.y);
    v66.lineTo(v70.end.x, v70.end.y);
    v66.stroke();
  });
  const v71 = [{
    'start': {
      'x': v67 + 30,
      'y': v68 - 25
    },
    'end': {
      'x': v67 + 50,
      'y': v68 - 45
    }
  }, {
    'start': {
      'x': v67 + 40,
      'y': v68 - 15
    },
    'end': {
      'x': v67 + 65,
      'y': v68 - 25
    }
  }, {
    'start': {
      'x': v67 + 50,
      'y': v68 - 5
    },
    'end': {
      'x': v67 + 75,
      'y': v68 - 10
    }
  }];
  v71.forEach(v72 => {
    v66.beginPath();
    v66.moveTo(v72.start.x, v72.start.y);
    v66.lineTo(v72.end.x, v72.end.y);
    v66.stroke();
  });
}
function addFireTail(v73, v74, v75) {
  v73.save();
  v73.globalCompositeOperation = "screen";
  v73.globalAlpha = 0.9;
  const v76 = v73.createLinearGradient(v74 - 20, v75 + 15, v74 - 120, v75 + 5);
  v76.addColorStop(0, "#FFFF00");
  v76.addColorStop(0.2, "#FFD700");
  v76.addColorStop(0.5, "#FF8C00");
  v76.addColorStop(0.8, "#FF4500");
  v76.addColorStop(1, '#DC143C');
  v73.strokeStyle = v76;
  v73.lineWidth = 12;
  v73.lineCap = "round";
  v73.beginPath();
  v73.moveTo(v74 - 20, v75 + 15);
  v73.bezierCurveTo(v74 - 50, v75 + 30, v74 - 80, v75 + 10, v74 - 120, v75 + 5);
  v73.stroke();
  for (let v77 = 0; v77 < 4; v77++) {
    const v78 = (Math.random() - 0.5) * 20;
    const v79 = 6 + Math.random() * 4;
    v73.lineWidth = v79;
    v73.beginPath();
    v73.moveTo(v74 - 20, v75 + 15);
    v73.bezierCurveTo(v74 - 45, v75 + 25 + v78, v74 - 75, v75 + 8 + v78, v74 - 110, v75 + 3 + v78);
    v73.stroke();
  }
  v73.strokeStyle = "rgba(255, 200, 100, 0.4)";
  v73.lineWidth = 25;
  v73.beginPath();
  v73.moveTo(v74 - 20, v75 + 15);
  v73.bezierCurveTo(v74 - 50, v75 + 30, v74 - 80, v75 + 10, v74 - 120, v75 + 5);
  v73.stroke();
  v73.restore();
}
function drawRebirthText(v80, v81, v82, v83) {
  const v84 = v82 * 0.35;
  const v85 = v83 * 0.6;
  v80.save();
  v80.shadowColor = "rgba(255, 100, 0, 0.8)";
  v80.shadowBlur = 40;
  const v86 = v80.createLinearGradient(v84 - 100, v85 - 50, v84 + 100, v85 + 50);
  v86.addColorStop(0, '#FFFF00');
  v86.addColorStop(0.2, "#FFD700");
  v86.addColorStop(0.5, '#FF8C00');
  v86.addColorStop(0.8, "#FF4500");
  v86.addColorStop(1, "#DC143C");
  v80.font = "bold 70px \"Arial\"";
  v80.textAlign = "center";
  v80.textBaseline = "middle";
  v80.fillStyle = v86;
  v80.fillText(v81.toUpperCase(), v84, v85);
  v80.shadowColor = 'transparent';
  v80.fillStyle = "rgba(255, 255, 200, 0.7)";
  v80.fillText(v81.toUpperCase(), v84, v85);
  v80.strokeStyle = "rgba(255, 255, 255, 0.8)";
  v80.lineWidth = 2;
  v80.strokeText(v81.toUpperCase(), v84, v85);
  addTextFlames(v80, v81, v84, v85);
  v80.restore();
}
function addTextFlames(v87, v88, v89, v90) {
  v87.save();
  v87.globalCompositeOperation = 'screen';
  const v91 = v87.measureText(v88.toUpperCase());
  const v92 = v91.width;
  for (let v93 = 0; v93 < 20; v93++) {
    const v94 = v89 - v92 / 2 + Math.random() * v92;
    const v95 = v90 + 35 - Math.random() * 10;
    const v96 = 10 + Math.random() * 20;
    const v97 = 2 + Math.random() * 4;
    const v98 = v87.createLinearGradient(v94, v95, v94, v95 - v96);
    v98.addColorStop(0, "rgba(255, 255, 200, 0.8)");
    v98.addColorStop(0.5, "rgba(255, 200, 100, 0.6)");
    v98.addColorStop(1, "rgba(255, 150, 50, 0.3)");
    v87.strokeStyle = v98;
    v87.lineWidth = v97;
    v87.lineCap = "round";
    v87.beginPath();
    v87.moveTo(v94, v95);
    v87.lineTo(v94, v95 - v96);
    v87.stroke();
  }
  v87.restore();
}
function addAshesParticles(v99, v100, v101) {
  v99.save();
  v99.globalAlpha = 0.6;
  for (let v102 = 0; v102 < 50; v102++) {
    const v103 = Math.random() * v100;
    const v104 = Math.random() * v101;
    const v105 = 1 + Math.random() * 3;
    const v106 = 80 + Math.random() * 40;
    v99.fillStyle = "rgba(" + v106 + ", " + v106 + ", " + v106 + ", 0.7)";
    v99.beginPath();
    v99.arc(v103, v104, v105, 0, Math.PI * 2);
    v99.fill();
    const v107 = 3 + Math.random() * 8;
    const v108 = Math.random() * Math.PI * 2;
    v99.strokeStyle = "rgba(" + v106 + ", " + v106 + ", " + v106 + ", 0.4)";
    v99.lineWidth = v105 * 0.5;
    v99.lineCap = "round";
    v99.beginPath();
    v99.moveTo(v103, v104);
    v99.lineTo(v103 + Math.cos(v108) * v107, v104 + Math.sin(v108) * v107);
    v99.stroke();
  }
  v99.restore();
}
function addRebirthParticles(v109, v110, v111) {
  v109.save();
  v109.globalCompositeOperation = "screen";
  for (let v112 = 0; v112 < 40; v112++) {
    const v113 = Math.random() * v110;
    const v114 = Math.random() * v111;
    const v115 = 1 + Math.random() * 4;
    const v116 = 30 + Math.random() * 30;
    v109.fillStyle = "hsla(" + v116 + ", 100%, 70%, 0.8)";
    v109.beginPath();
    v109.arc(v113, v114, v115, 0, Math.PI * 2);
    v109.fill();
    v109.fillStyle = "hsla(" + v116 + ", 100%, 70%, 0.3)";
    v109.beginPath();
    v109.arc(v113, v114, v115 * 2, 0, Math.PI * 2);
    v109.fill();
  }
  v109.restore();
}
function addFloatingEmbers(v117, v118, v119) {
  v117.save();
  v117.globalCompositeOperation = "screen";
  for (let v120 = 0; v120 < 30; v120++) {
    const v121 = Math.random() * v118;
    const v122 = Math.random() * v119;
    const v123 = 1 + Math.random() * 2;
    const v124 = 0.6 + Math.random() * 0.4;
    v117.fillStyle = "rgba(255, 255, 200, " + v124 + ')';
    v117.beginPath();
    v117.arc(v121, v122, v123, 0, Math.PI * 2);
    v117.fill();
    v117.fillStyle = "rgba(255, 200, 100, " + v124 * 0.3 + ')';
    v117.beginPath();
    v117.arc(v121, v122, v123 * 3, 0, Math.PI * 2);
    v117.fill();
  }
  v117.restore();
}
function addFireTrails(v125, v126, v127) {
  v125.save();
  v125.globalCompositeOperation = "screen";
  v125.globalAlpha = 0.3;
  for (let v128 = 0; v128 < 5; v128++) {
    const v129 = Math.random() * v126;
    const v130 = v127 + 20;
    const v131 = v129 + (Math.random() - 0.5) * 100;
    const v132 = Math.random() * v127 * 0.3;
    const v133 = v125.createLinearGradient(v129, v130, v131, v132);
    v133.addColorStop(0, "rgba(255, 255, 200, 0.6)");
    v133.addColorStop(0.5, "rgba(255, 200, 100, 0.4)");
    v133.addColorStop(1, "rgba(255, 150, 50, 0.2)");
    v125.strokeStyle = v133;
    v125.lineWidth = 8;
    v125.lineCap = "round";
    v125.beginPath();
    v125.moveTo(v129, v130);
    v125.lineTo(v131, v132);
    v125.stroke();
  }
  v125.restore();
}
function addMysticalEnergy(v134, v135, v136) {
  v134.save();
  v134.globalCompositeOperation = 'screen';
  v134.globalAlpha = 0.2;
  const v137 = [{
    'x': v135 * 0.2,
    'y': v136 * 0.3,
    'size': 0x28
  }, {
    'x': v135 * 0.8,
    'y': v136 * 0.7,
    'size': 0x23
  }, {
    'x': v135 * 0.4,
    'y': v136 * 0.2,
    'size': 0x2d
  }];
  v137.forEach(v138 => {
    const v139 = v134.createRadialGradient(v138.x, v138.y, 0, v138.x, v138.y, v138.size);
    v139.addColorStop(0, "rgba(255, 255, 200, 0.6)");
    v139.addColorStop(1, 'transparent');
    v134.fillStyle = v139;
    v134.beginPath();
    v134.arc(v138.x, v138.y, v138.size, 0, Math.PI * 2);
    v134.fill();
  });
  v134.restore();
}
function addNebulaBackground(v140, v141, v142) {
  v140.save();
  v140.globalAlpha = 0.15;
  v140.globalCompositeOperation = 'screen';
  const v143 = [{
    'x': v141 * 0.3,
    'y': v142 * 0.4,
    'size': 0x78,
    'color': [255, 100, 0]
  }, {
    'x': v141 * 0.7,
    'y': v142 * 0.3,
    'size': 0x64,
    'color': [255, 150, 50]
  }, {
    'x': v141 * 0.5,
    'y': v142 * 0.6,
    'size': 0x6e,
    'color': [255, 200, 100]
  }];
  v143.forEach(v144 => {
    const [v145, v146, v147] = v144.color;
    const v148 = v140.createRadialGradient(v144.x, v144.y, 0, v144.x, v144.y, v144.size);
    v148.addColorStop(0, 'rgba(' + v145 + ", " + v146 + ", " + v147 + ", 0.4)");
    v148.addColorStop(1, "transparent");
    v140.fillStyle = v148;
    v140.beginPath();
    v140.arc(v144.x, v144.y, v144.size, 0, Math.PI * 2);
    v140.fill();
  });
  v140.restore();
}
function drawPhoenixBorder(v149, v150, v151) {
  v149.save();
  const v152 = v149.createLinearGradient(0, 0, v150, 0);
  v152.addColorStop(0, "#DC143C");
  v152.addColorStop(0.2, "#FF4500");
  v152.addColorStop(0.5, '#FFD700');
  v152.addColorStop(0.8, "#FF4500");
  v152.addColorStop(1, '#DC143C');
  v149.strokeStyle = v152;
  v149.lineWidth = 10;
  v149.shadowColor = "rgba(255, 100, 0, 0.8)";
  v149.shadowBlur = 25;
  v149.strokeRect(10, 10, v150 - 20, v151 - 20);
  v149.strokeStyle = "rgba(255, 255, 200, 0.6)";
  v149.lineWidth = 3;
  v149.shadowBlur = 15;
  v149.strokeRect(20, 20, v150 - 40, v151 - 40);
  addPhoenixFeatherAccents(v149, v150, v151);
  v149.restore();
}
function addPhoenixFeatherAccents(v153, v154, v155) {
  v153.save();
  v153.globalAlpha = 0.7;
  const v156 = [{
    'x': 0x19,
    'y': 0x19,
    'angle': -0.8
  }, {
    'x': v154 - 25,
    'y': 0x19,
    'angle': -2.4
  }, {
    'x': 0x19,
    'y': v155 - 25,
    'angle': 0.8
  }, {
    'x': v154 - 25,
    'y': v155 - 25,
    'angle': 2.4
  }];
  v156.forEach(v157 => {
    const v158 = v153.createLinearGradient(v157.x, v157.y, v157.x + Math.cos(v157.angle) * 20, v157.y + Math.sin(v157.angle) * 20);
    v158.addColorStop(0, '#FFD700');
    v158.addColorStop(1, "#FF4500");
    v153.strokeStyle = v158;
    v153.lineWidth = 4;
    v153.lineCap = 'round';
    v153.beginPath();
    v153.moveTo(v157.x, v157.y);
    v153.lineTo(v157.x + Math.cos(v157.angle) * 20, v157.y + Math.sin(v157.angle) * 20);
    v153.stroke();
    for (let v159 = 0; v159 < 3; v159++) {
      const v160 = 5 + v159 * 5;
      const v161 = v157.angle + 0.3;
      const v162 = 8 - v159 * 2;
      v153.beginPath();
      v153.moveTo(v157.x + Math.cos(v157.angle) * v160, v157.y + Math.sin(v157.angle) * v160);
      v153.lineTo(v157.x + Math.cos(v157.angle) * v160 + Math.cos(v161) * v162, v157.y + Math.sin(v157.angle) * v160 + Math.sin(v161) * v162);
      v153.stroke();
    }
  });
  v153.restore();
}
function addPhoenixSignature(v163, v164, v165) {
  v163.save();
  const v166 = v164 - 110;
  const v167 = v165 - 25;
  v163.font = "italic 14px \"Arial\"";
  v163.fillStyle = "rgba(255, 255, 200, 0.9)";
  v163.textAlign = "right";
  v163.textBaseline = "bottom";
  v163.shadowColor = "rgba(255, 100, 0, 0.6)";
  v163.shadowBlur = 10;
  v163.fillText("by " + (config.botName || "JuneX-Ultra"), v166, v167);
  const v168 = v163.createLinearGradient(v166 + 5, v167 - 8, v166 + 15, v167 - 8);
  v168.addColorStop(0, "#FFD700");
  v168.addColorStop(1, "#FF4500");
  v163.strokeStyle = v168;
  v163.lineWidth = 2;
  v163.lineCap = "round";
  v163.beginPath();
  v163.moveTo(v166 + 5, v167 - 8);
  v163.lineTo(v166 + 15, v167 - 8);
  v163.stroke();
  v163.beginPath();
  v163.moveTo(v166 + 8, v167 - 8);
  v163.lineTo(v166 + 6, v167 - 12);
  v163.stroke();
  v163.restore();
}
