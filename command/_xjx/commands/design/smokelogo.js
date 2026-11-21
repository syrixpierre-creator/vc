const {
  createCanvas
} = require("@napi-rs/canvas");
const config = require('../../config');
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
  v1.textBaseline = "bottom";
  v1.fillStyle = "#FFFFFF";
  v1.strokeStyle = '#000000';
  v1.lineWidth = 2;
  v1.strokeText(v4, v2 / 2, v3 - 10);
  v1.fillText(v4, v2 / 2, v3 - 10);
  v1.restore();
}
module.exports = {
  'name': "smokelogo",
  'description': "Create ethereal smoke text logos with vapor and mist effects",
  'category': 'design',
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (v7.length === 0) {
        await v5.sendMessage(v8, {
          'text': "💨 *SMOKE LOGO*\n\n*smoke*\nsmoke <text>\n\n*Example:*\nsmoke SMOKE\nsmoke VAPOR\nsmoke MIST\n\n" + ("> Powered by " + (config.botName || 'JuneX-Ultra'))
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
      const v10 = await generateSmokeLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "💨 *Smoke Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || 'JuneX-Ultra') + '_'
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
      console.error("❌ [SMOKELOGO] ERROR:", v11);
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
async function generateSmokeLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  createSmokyBackground(v14, 800, 400);
  drawSmokePlume(v14, 600, 280);
  addSmokeWisps(v14, 800, 400);
  addVaporTrails(v14, 800, 400);
  drawSmokyText(v14, v12, 800, 400);
  addMistLayers(v14, 800, 400);
  addSmokeParticles(v14, 800, 400);
  addFloatingEmbers(v14, 800, 400);
  addAshParticles(v14, 800, 400);
  drawSmokeBorder(v14, 800, 400);
  addSmokeSignature(v14, 800, 400);
  addWatermark(v14, 800, 400);
  return v13.toBuffer("image/png");
}
function createSmokyBackground(v15, v16, v17) {
  const v18 = v15.createLinearGradient(0, 0, 0, v17);
  v18.addColorStop(0, "#1a1a2a");
  v18.addColorStop(0.3, "#2d2d4a");
  v18.addColorStop(0.6, '#4a4a6a');
  v18.addColorStop(1, "#1a1a2a");
  v15.fillStyle = v18;
  v15.fillRect(0, 0, v16, v17);
  addBackgroundSmoke(v15, v16, v17);
}
function addBackgroundSmoke(v19, v20, v21) {
  v19.save();
  v19.globalAlpha = 0.1;
  for (let v22 = 0; v22 < 8; v22++) {
    const v23 = Math.random() * v20;
    const v24 = Math.random() * v21;
    const v25 = 80 + Math.random() * 120;
    const v26 = v19.createRadialGradient(v23, v24, 0, v23, v24, v25);
    v26.addColorStop(0, "rgba(150, 150, 180, 0.4)");
    v26.addColorStop(1, 'transparent');
    v19.fillStyle = v26;
    v19.beginPath();
    v19.arc(v23, v24, v25, 0, Math.PI * 2);
    v19.fill();
  }
  v19.restore();
}
function drawSmokePlume(v27, v28, v29) {
  v27.save();
  const v30 = [{
    'size': 0x78,
    'alpha': 0.3,
    'yOffset': -80
  }, {
    'size': 0x64,
    'alpha': 0.4,
    'yOffset': -120
  }, {
    'size': 0x50,
    'alpha': 0.5,
    'yOffset': -160
  }, {
    'size': 0x3c,
    'alpha': 0.6,
    'yOffset': -200
  }, {
    'size': 0x28,
    'alpha': 0.7,
    'yOffset': -240
  }];
  v30.forEach((v31, v32) => {
    drawSmokeLayer(v27, v28, v29 + v31.yOffset, v31.size, v31.alpha, v32);
  });
  drawSmokeSource(v27, v28, v29);
  v27.restore();
}
function drawSmokeLayer(v33, v34, v35, v36, v37, v38) {
  const v39 = v33.createRadialGradient(v34, v35, 0, v34, v35, v36);
  v39.addColorStop(0, "rgba(220, 220, 240, " + v37 + ')');
  v39.addColorStop(0.5, "rgba(180, 180, 200, " + v37 * 0.7 + ')');
  v39.addColorStop(1, "rgba(120, 120, 150, " + v37 * 0.3 + ')');
  v33.fillStyle = v39;
  v33.beginPath();
  const v40 = v36 * 0.3;
  v33.moveTo(v34 - v36 * 0.3, v35);
  v33.bezierCurveTo(v34 - v36 * 0.6, v35 - v36 * 0.2 + Math.sin(v38) * v40, v34 - v36 * 0.4, v35 - v36 * 0.6 + Math.cos(v38 * 0.7) * v40, v34, v35 - v36);
  v33.bezierCurveTo(v34 + v36 * 0.4, v35 - v36 * 0.6 + Math.sin(v38 * 0.5) * v40, v34 + v36 * 0.6, v35 - v36 * 0.2 + Math.cos(v38 * 0.3) * v40, v34 + v36 * 0.3, v35);
  v33.bezierCurveTo(v34 + v36 * 0.2, v35 + v36 * 0.1, v34 - v36 * 0.2, v35 + v36 * 0.1, v34 - v36 * 0.3, v35);
  v33.closePath();
  v33.fill();
  addSmokeWispsToLayer(v33, v34, v35 - v36 * 0.5, v36 * 0.8, v37);
}
function addSmokeWispsToLayer(v41, v42, v43, v44, v45) {
  v41.save();
  v41.globalAlpha = v45 * 0.8;
  for (let v46 = 0; v46 < 5; v46++) {
    const v47 = v46 / 5 * Math.PI * 2;
    const v48 = v44 * 0.3;
    const v49 = v42 + Math.cos(v47) * v48;
    const v50 = v43 + Math.sin(v47) * v48;
    const v51 = v44 * 0.2;
    const v52 = v41.createRadialGradient(v49, v50, 0, v49, v50, v51);
    v52.addColorStop(0, "rgba(240, 240, 255, " + v45 + ')');
    v52.addColorStop(1, "transparent");
    v41.fillStyle = v52;
    v41.beginPath();
    v41.arc(v49, v50, v51, 0, Math.PI * 2);
    v41.fill();
  }
  v41.restore();
}
function drawSmokeSource(v53, v54, v55) {
  const v56 = v53.createRadialGradient(v54, v55, 0, v54, v55, 15);
  v56.addColorStop(0, "rgba(255, 100, 50, 0.9)");
  v56.addColorStop(0.5, "rgba(255, 50, 0, 0.6)");
  v56.addColorStop(1, "transparent");
  v53.fillStyle = v56;
  v53.beginPath();
  v53.arc(v54, v55, 15, 0, Math.PI * 2);
  v53.fill();
  v53.fillStyle = "rgba(255, 150, 100, 0.8)";
  v53.beginPath();
  v53.arc(v54, v55, 8, 0, Math.PI * 2);
  v53.fill();
  v53.fillStyle = "rgba(255, 255, 200, 0.9)";
  v53.beginPath();
  v53.arc(v54, v55, 4, 0, Math.PI * 2);
  v53.fill();
}
function addSmokeWisps(v57, v58, v59) {
  v57.save();
  v57.globalAlpha = 0.6;
  for (let v60 = 0; v60 < 12; v60++) {
    const v61 = Math.random() * v58;
    const v62 = Math.random() * v59;
    const v63 = 20 + Math.random() * 40;
    const v64 = 0.3 + Math.random() * 0.4;
    drawSmokeWisp(v57, v61, v62, v63, v64);
  }
  for (let v65 = 0; v65 < 20; v65++) {
    const v66 = Math.random() * v58;
    const v67 = Math.random() * v59;
    const v68 = 10 + Math.random() * 20;
    const v69 = 0.4 + Math.random() * 0.3;
    drawSmokeWisp(v57, v66, v67, v68, v69);
  }
  v57.restore();
}
function drawSmokeWisp(v70, v71, v72, v73, v74) {
  const v75 = v70.createRadialGradient(v71, v72, 0, v71, v72, v73);
  v75.addColorStop(0, "rgba(220, 220, 240, " + v74 + ')');
  v75.addColorStop(0.7, "rgba(180, 180, 200, " + v74 * 0.6 + ')');
  v75.addColorStop(1, "rgba(120, 120, 150, " + v74 * 0.2 + ')');
  v70.fillStyle = v75;
  v70.beginPath();
  const v76 = v73 * 0.4;
  v70.moveTo(v71 - v73 * 0.3, v72);
  v70.bezierCurveTo(v71 - v73 * 0.5, v72 - v73 * 0.2 + Math.random() * v76, v71 - v73 * 0.3, v72 - v73 * 0.5 + Math.random() * v76, v71, v72 - v73);
  v70.bezierCurveTo(v71 + v73 * 0.3, v72 - v73 * 0.5 + Math.random() * v76, v71 + v73 * 0.5, v72 - v73 * 0.2 + Math.random() * v76, v71 + v73 * 0.3, v72);
  v70.bezierCurveTo(v71 + v73 * 0.2, v72 + v73 * 0.1, v71 - v73 * 0.2, v72 + v73 * 0.1, v71 - v73 * 0.3, v72);
  v70.closePath();
  v70.fill();
}
function addVaporTrails(v77, v78, v79) {
  v77.save();
  v77.globalAlpha = 0.4;
  for (let v80 = 0; v80 < 8; v80++) {
    const v81 = Math.random() * v78;
    const v82 = v79 + 20;
    const v83 = v81 + (Math.random() - 0.5) * 60;
    const v84 = Math.random() * v79 * 0.5;
    const v85 = 5 + Math.random() * 10;
    const v86 = v77.createLinearGradient(v81, v82, v83, v84);
    v86.addColorStop(0, "rgba(200, 200, 220, 0.6)");
    v86.addColorStop(0.5, "rgba(160, 160, 180, 0.4)");
    v86.addColorStop(1, "transparent");
    v77.strokeStyle = v86;
    v77.lineWidth = v85;
    v77.lineCap = 'round';
    v77.beginPath();
    v77.moveTo(v81, v82);
    v77.bezierCurveTo(v81 + (Math.random() - 0.5) * 40, v82 - 80, v83 + (Math.random() - 0.5) * 40, v84 + 40, v83, v84);
    v77.stroke();
  }
  v77.restore();
}
function drawSmokyText(v87, v88, v89, v90) {
  const v91 = v89 * 0.35;
  const v92 = v90 * 0.6;
  v87.save();
  v87.shadowColor = "rgba(150, 150, 180, 0.8)";
  v87.shadowBlur = 30;
  const v93 = v87.createLinearGradient(v91 - 100, v92 - 50, v91 + 100, v92 + 50);
  v93.addColorStop(0, '#E8E8F0');
  v93.addColorStop(0.3, "#C8C8D8");
  v93.addColorStop(0.7, '#A8A8C0');
  v93.addColorStop(1, '#E8E8F0');
  v87.font = "bold 70px \"Arial\"";
  v87.textAlign = "center";
  v87.textBaseline = "middle";
  v87.fillStyle = v93;
  v87.fillText(v88.toUpperCase(), v91, v92);
  v87.shadowColor = "transparent";
  v87.fillStyle = "rgba(240, 240, 255, 0.7)";
  v87.fillText(v88.toUpperCase(), v91, v92);
  v87.strokeStyle = "rgba(200, 200, 220, 0.8)";
  v87.lineWidth = 2;
  v87.strokeText(v88.toUpperCase(), v91, v92);
  addTextSmoke(v87, v88, v91, v92);
  v87.restore();
}
function addTextSmoke(v94, v95, v96, v97) {
  v94.save();
  v94.globalCompositeOperation = "overlay";
  v94.globalAlpha = 0.3;
  const v98 = v94.measureText(v95.toUpperCase());
  const v99 = v98.width;
  for (let v100 = 0; v100 < 15; v100++) {
    const v101 = v96 - v99 / 2 + Math.random() * v99;
    const v102 = v97 + 35;
    const v103 = 10 + Math.random() * 30;
    const v104 = 2 + Math.random() * 4;
    const v105 = v94.createLinearGradient(v101, v102, v101, v102 - v103);
    v105.addColorStop(0, "rgba(200, 200, 220, 0.6)");
    v105.addColorStop(1, 'transparent');
    v94.strokeStyle = v105;
    v94.lineWidth = v104;
    v94.lineCap = "round";
    v94.beginPath();
    v94.moveTo(v101, v102);
    v94.lineTo(v101, v102 - v103);
    v94.stroke();
  }
  for (let v106 = 0; v106 < 8; v106++) {
    const v107 = v96 - v99 / 2 + Math.random() * v99;
    const v108 = v97 - 35 + Math.random() * 70;
    const v109 = 5 + Math.random() * 10;
    const v110 = v94.createRadialGradient(v107, v108, 0, v107, v108, v109);
    v110.addColorStop(0, "rgba(220, 220, 240, 0.5)");
    v110.addColorStop(1, 'transparent');
    v94.fillStyle = v110;
    v94.beginPath();
    v94.arc(v107, v108, v109, 0, Math.PI * 2);
    v94.fill();
  }
  v94.restore();
}
function addMistLayers(v111, v112, v113) {
  v111.save();
  v111.globalAlpha = 0.2;
  const v114 = v111.createLinearGradient(0, v113 * 0.7, 0, v113);
  v114.addColorStop(0, "rgba(120, 120, 150, 0.4)");
  v114.addColorStop(1, "transparent");
  v111.fillStyle = v114;
  v111.fillRect(0, v113 * 0.7, v112, v113 * 0.3);
  for (let v115 = 0; v115 < 5; v115++) {
    const v116 = Math.random() * v112;
    const v117 = v113 * 0.3 + Math.random() * v113 * 0.4;
    const v118 = 60 + Math.random() * 80;
    const v119 = v111.createRadialGradient(v116, v117, 0, v116, v117, v118);
    v119.addColorStop(0, "rgba(150, 150, 180, 0.3)");
    v119.addColorStop(1, "transparent");
    v111.fillStyle = v119;
    v111.beginPath();
    v111.arc(v116, v117, v118, 0, Math.PI * 2);
    v111.fill();
  }
  v111.restore();
}
function addSmokeParticles(v120, v121, v122) {
  v120.save();
  v120.globalAlpha = 0.6;
  for (let v123 = 0; v123 < 50; v123++) {
    const v124 = Math.random() * v121;
    const v125 = Math.random() * v122;
    const v126 = 1 + Math.random() * 4;
    const v127 = 180 + Math.random() * 40;
    const v128 = 0.3 + Math.random() * 0.4;
    v120.fillStyle = "rgba(" + v127 + ", " + v127 + ", " + (v127 + 20) + ", " + v128 + ')';
    v120.beginPath();
    v120.arc(v124, v125, v126, 0, Math.PI * 2);
    v120.fill();
    const v129 = 3 + Math.random() * 8;
    const v130 = Math.random() * Math.PI * 2;
    v120.strokeStyle = "rgba(" + v127 + ", " + v127 + ", " + (v127 + 20) + ", " + v128 * 0.5 + ')';
    v120.lineWidth = v126 * 0.5;
    v120.lineCap = "round";
    v120.beginPath();
    v120.moveTo(v124, v125);
    v120.lineTo(v124 + Math.cos(v130) * v129, v125 + Math.sin(v130) * v129);
    v120.stroke();
  }
  v120.restore();
}
function addFloatingEmbers(v131, v132, v133) {
  v131.save();
  v131.globalCompositeOperation = "screen";
  for (let v134 = 0; v134 < 20; v134++) {
    const v135 = v132 * 0.7 + (Math.random() - 0.5) * 100;
    const v136 = v133 * 0.5 + Math.random() * v133 * 0.4;
    const v137 = 1 + Math.random() * 3;
    const v138 = 0.6 + Math.random() * 0.4;
    v131.fillStyle = "rgba(255, 200, 100, " + v138 + ')';
    v131.beginPath();
    v131.arc(v135, v136, v137, 0, Math.PI * 2);
    v131.fill();
    const v139 = 5 + Math.random() * 10;
    const v140 = -Math.PI * 0.5 + (Math.random() - 0.5) * 0.5;
    v131.strokeStyle = "rgba(255, 150, 50, " + v138 * 0.5 + ')';
    v131.lineWidth = v137 * 0.5;
    v131.lineCap = "round";
    v131.beginPath();
    v131.moveTo(v135, v136);
    v131.lineTo(v135 + Math.cos(v140) * v139, v136 + Math.sin(v140) * v139);
    v131.stroke();
  }
  v131.restore();
}
function addAshParticles(v141, v142, v143) {
  v141.save();
  v141.globalAlpha = 0.5;
  for (let v144 = 0; v144 < 30; v144++) {
    const v145 = Math.random() * v142;
    const v146 = Math.random() * v143;
    const v147 = 1 + Math.random() * 2;
    const v148 = 80 + Math.random() * 40;
    v141.fillStyle = "rgba(" + v148 + ", " + v148 + ", " + v148 + ", 0.7)";
    v141.beginPath();
    v141.arc(v145, v146, v147, 0, Math.PI * 2);
    v141.fill();
    const v149 = 3 + Math.random() * 6;
    v141.strokeStyle = 'rgba(' + v148 + ", " + v148 + ", " + v148 + ", 0.4)";
    v141.lineWidth = v147 * 0.5;
    v141.lineCap = 'round';
    v141.beginPath();
    v141.moveTo(v145, v146);
    v141.lineTo(v145, v146 + v149);
    v141.stroke();
  }
  v141.restore();
}
function drawSmokeBorder(v150, v151, v152) {
  v150.save();
  const v153 = v150.createLinearGradient(0, 0, v151, 0);
  v153.addColorStop(0, "#A8A8C0");
  v153.addColorStop(0.3, "#C8C8D8");
  v153.addColorStop(0.5, "#E8E8F0");
  v153.addColorStop(0.7, "#C8C8D8");
  v153.addColorStop(1, "#A8A8C0");
  v150.strokeStyle = v153;
  v150.lineWidth = 10;
  v150.shadowColor = "rgba(150, 150, 180, 0.6)";
  v150.shadowBlur = 20;
  v150.strokeRect(10, 10, v151 - 20, v152 - 20);
  v150.strokeStyle = "rgba(200, 200, 220, 0.6)";
  v150.lineWidth = 3;
  v150.shadowBlur = 15;
  v150.strokeRect(20, 20, v151 - 40, v152 - 40);
  addSmokeCorners(v150, v151, v152);
  v150.restore();
}
function addSmokeCorners(v154, v155, v156) {
  v154.save();
  v154.globalAlpha = 0.7;
  const v157 = [{
    'x': 0x19,
    'y': 0x19
  }, {
    'x': v155 - 25,
    'y': 0x19
  }, {
    'x': 0x19,
    'y': v156 - 25
  }, {
    'x': v155 - 25,
    'y': v156 - 25
  }];
  v157.forEach(v158 => {
    const v159 = v154.createRadialGradient(v158.x, v158.y, 0, v158.x, v158.y, 12);
    v159.addColorStop(0, "rgba(220, 220, 240, 0.8)");
    v159.addColorStop(1, 'transparent');
    v154.fillStyle = v159;
    v154.beginPath();
    v154.arc(v158.x, v158.y, 12, 0, Math.PI * 2);
    v154.fill();
  });
  v154.restore();
}
function addSmokeSignature(v160, v161, v162) {
  v160.save();
  const v163 = v161 - 110;
  const v164 = v162 - 25;
  v160.font = "italic 14px \"Arial\"";
  v160.fillStyle = "rgba(200, 200, 220, 0.9)";
  v160.textAlign = "right";
  v160.textBaseline = "bottom";
  v160.shadowColor = "rgba(150, 150, 180, 0.6)";
  v160.shadowBlur = 10;
  v160.fillText("by " + (config.botName || 'JuneX-Ultra'), v163, v164);
  const v165 = v160.createRadialGradient(v163 + 5, v164 - 8, 0, v163 + 5, v164 - 8, 6);
  v165.addColorStop(0, "rgba(220, 220, 240, 0.8)");
  v165.addColorStop(1, "transparent");
  v160.fillStyle = v165;
  v160.beginPath();
  v160.arc(v163 + 5, v164 - 8, 6, 0, Math.PI * 2);
  v160.fill();
  v160.restore();
}
